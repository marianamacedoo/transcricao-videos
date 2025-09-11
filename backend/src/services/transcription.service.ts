import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import FormData from 'form-data';
import { updateRecord } from './db.service';

const execAsync = promisify(exec);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
const OPENAI_TRANSCRIPT_URL = 'https://api.openai.com/v1/audio/transcriptions';

// converte um arquivo de áudio para MP3 usando o ffmpeg
async function convertToMp3(inputPath: string): Promise<string> {
  const outPath = `${inputPath}.mp3`;
  const cmd = `ffmpeg -y -i "${inputPath}" -vn -acodec libmp3lame -ar 44100 -ac 2 "${outPath}"`;
  await execAsync(cmd);
  return outPath;
}

// inicia o processo de transcrição de forma assíncrona
export async function createTranscriptionAsync(id: string, filePath: string): Promise<string | null> {
  try {
    // garantir que é áudio
    const ext = path.extname(filePath).toLowerCase();
    let audioPath = filePath;
    const audioExts = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg'];
    if (!audioExts.includes(ext)) {
      // converte usando ffmpeg (necessário ter ffmpeg no PATH)
      audioPath = await convertToMp3(filePath);
    }

    // chamada para OpenAI (Whisper / speech-to-text) via REST
    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1'); 


    // requisição POST para a OpenAI com o arquivo e o token de autorização.
    const response = await axios.post(OPENAI_TRANSCRIPT_URL, form, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders()
      },
      maxBodyLength: Infinity
    });

    const text = response.data?.text ?? '';

    // salvar resultado em arquivo .txt
    const outTxt = path.resolve(UPLOADS_DIR, `${id}.txt`);
    fs.writeFileSync(outTxt, text, 'utf8');

    // remover arquivos temporários 
    // fs.unlinkSync(audioPath); //  remover o mp3 convertido
    // fs.unlinkSync(filePath); //  remover o upload original

    return outTxt;
  } catch (err) {
    console.error('Erro createTranscriptionAsync:', err);
    await updateRecord(id, { status: 'failed' });
    return null;
  }
}
