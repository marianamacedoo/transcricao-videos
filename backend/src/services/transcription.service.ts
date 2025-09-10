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

async function convertToMp3(inputPath: string): Promise<string> {
  const outPath = `${inputPath}.mp3`;
  // comando ffmpeg: extrai áudio para mp3
  const cmd = `ffmpeg -y -i "${inputPath}" -vn -acodec libmp3lame -ar 44100 -ac 2 "${outPath}"`;
  await execAsync(cmd);
  return outPath;
}

export async function createTranscriptionAsync(id: string, filePath: string): Promise<string | null> {
  try {
    // 1) Garantir que é áudio (extensões comuns)
    const ext = path.extname(filePath).toLowerCase();
    let audioPath = filePath;
    const audioExts = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg'];
    if (!audioExts.includes(ext)) {
      // converte usando ffmpeg (necessário ter ffmpeg no PATH)
      audioPath = await convertToMp3(filePath);
    }

    // 2) Chamada para OpenAI (Whisper / speech-to-text) via REST
    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1'); // modelo exemplo; ver docs do OpenAI

    const response = await axios.post(OPENAI_TRANSCRIPT_URL, form, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders()
      },
      maxBodyLength: Infinity
    });

    const text = response.data?.text ?? '';

    // 3) salvar resultado em arquivo .txt
    const outTxt = path.resolve(UPLOADS_DIR, `${id}.txt`);
    fs.writeFileSync(outTxt, text, 'utf8');

    // 4) opcional: remover arquivos temporários (comente se quiser manter para debug)
    // fs.unlinkSync(audioPath); // se quiser remover o mp3 convertido
    // fs.unlinkSync(filePath); // se quiser remover o upload original

    return outTxt;
  } catch (err) {
    console.error('Erro createTranscriptionAsync:', err);
    await updateRecord(id, { status: 'failed' });
    return null;
  }
}
