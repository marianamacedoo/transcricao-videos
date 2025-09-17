import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import fluentFfmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import FormData from 'form-data';
import { updateRecord } from './db.service';

const OPENAI_TRANSCRIPT_URL = 'https://api.openai.com/v1/audio/transcriptions';
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

async function transcribeChunk(chunkPath: string): Promise<string> {
    const form = new FormData();
    form.append('file', fs.createReadStream(chunkPath));
    form.append('model', 'whisper-1');

    const response = await axios.post(OPENAI_TRANSCRIPT_URL, form, {
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...form.getHeaders()
        },
        maxBodyLength: Infinity
    });

    return response.data?.text ?? '';
}

export async function createLargeTranscriptionAsync(id: string, filePath: string): Promise<string | null> {
    const textChunks: string[] = [];
    const filesToDelete: string[] = [filePath];
    const maxChunkSize = 20 * 1024 * 1024; // 20MB para garantir que fique abaixo do limite
    console.log('Iniciando o processamento de arquivo grande...');
    
    try {
        const audioSize = fs.statSync(filePath).size;
        const totalDuration = await getMediaDuration(filePath);
        const chunkDuration = (totalDuration * maxChunkSize) / audioSize;

        await new Promise<void>((resolve, reject) => {
            fluentFfmpeg(filePath)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .addOptions([
                    `-map 0:a`,
                    `-acodec libmp3lame`,
                    `-f segment`,
                    `-segment_time ${chunkDuration}`,
                    `-segment_list_type m3u8`,
                    `-segment_start_number 0`
                ])
                .save(path.join(path.dirname(filePath), 'temp-chunk-%03d.mp3'));
        });

        // Transcreve cada pedaço e une os resultados
        const chunkFiles = fs.readdirSync(path.dirname(filePath)).filter(file => file.startsWith('temp-chunk-'));
        for (const chunkFile of chunkFiles) {
            const chunkPath = path.join(path.dirname(filePath), chunkFile);
            const chunkText = await transcribeChunk(chunkPath);
            textChunks.push(chunkText);
            filesToDelete.push(chunkPath); // Adiciona os pedaços para deletar
        }

        const fullText = textChunks.join(' ');
        const outTxtPath = path.resolve(UPLOADS_DIR, `${id}.txt`);
        await fsp.writeFile(outTxtPath, fullText, 'utf-8');

        return outTxtPath;
    } catch (err) {
        await updateRecord(id, { status: 'failed' });
        return null;
    } finally {
        for (const file of filesToDelete) {
            if (fs.existsSync(file)) {
                await fsp.unlink(file);
            }
        }
    }
}

async function getMediaDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        fluentFfmpeg.ffprobe(filePath, (err, data) => {
            if (err) reject(err);
            resolve(data.format.duration || 0);
        });
    });
}