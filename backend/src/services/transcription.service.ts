import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import FormData from 'form-data';
import { updateRecord, getLastTranscriptionByUserId } from './db.service';
import { createLargeTranscriptionAsync } from './largeFile.service';

const execAsync = promisify(exec);
const OPENAI_TRANSCRIPT_URL = 'https://api.openai.com/v1/audio/transcriptions';
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

/**
 * @function getMediaDuration
 * @description Obtém a duração de um arquivo de mídia em segundos usando ffprobe.
 */
export async function getMediaDuration(filePath: string): Promise<number> {
    const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
    return parseFloat(stdout);
}

/**
 * @function convertToMp3
 * @description Converte um arquivo de mídia para o formato MP3 usando ffmpeg
 */
async function convertToMp3(inputPath: string): Promise<string> {
  const outPath = `${inputPath}.mp3`;
  const cmd = `ffmpeg -y -i "${inputPath}" -vn -acodec libmp3lame -ar 44100 -ac 2 "${outPath}"`;
  await execAsync(cmd);
  return outPath;
}

/**
 * @function createTranscriptionAsync
 * @description Inicia o processo de transcrição de forma assíncrona.
 * Ele lida com arquivos de mídia de tamanho pequeno (até 25MB) e delega
 * para outro serviço se o arquivo for grande.
 * @param {string} id - O ID único da transcrição.
 * @param {string} filePath - O caminho do arquivo de mídia.
 * @param {number} dailyUse - O uso diário atual para a atualização do banco de dados.
 * @returns {Promise<string | null>} O caminho para o arquivo de texto da transcrição ou null em caso de erro.
 */
export async function createTranscriptionAsync(id: string, filePath: string, dailyUse: number): Promise<string | null> {
  const filesToDelete: string[] = [filePath]; // armazena o caminho original

  try {
    
    const fileSizeInBytes = fs.statSync(filePath).size;
    const maxFileSize = 25 * 1024 * 1024; // 25MB em bytes
    let outTxtPath: string | null = null;

    if (fileSizeInBytes > maxFileSize){
      console.log('Arquivo é maior que 25MB. Usando a lógica de arquivos grandes...');
      outTxtPath = await createLargeTranscriptionAsync(id, filePath);
    } else{
      console.log('Arquivo é menor que 25MB. Usando a lógica padrão...');
      
      const ext = path.extname(filePath).toLowerCase();
      let audioPath = filePath;
      const audioExts = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg'];
      
      //se nao tiver a extensao do audio
      if (!audioExts.includes(ext)) {
        audioPath = await convertToMp3(filePath);
        filesToDelete.push(audioPath); // adiciona o arquivo convertido para ser deletado
      }

      // chamada para API de transcrição
      const form = new FormData();
      form.append('file', fs.createReadStream(audioPath));
      form.append('model', 'whisper-1');

      const response = await axios.post(OPENAI_TRANSCRIPT_URL, form, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        },
        maxBodyLength: Infinity
      });

      // pega o texto da transcrição e a duração do áudio 
      const text = response.data?.text ?? '';
      const audioDurationInSeconds = response.data?.usage?.seconds ?? 0;
      const audioDurationInMinutes = audioDurationInSeconds / 60;
      
      // salva o resultado em um arquivo .txt e retorna o caminho.
      outTxtPath = path.resolve(UPLOADS_DIR, `${id}.txt`);
      await fsp.writeFile(outTxtPath, text, 'utf-8');
      
      // remove os arquivos temporários de áudio.
      for (const file of filesToDelete) {
        if (fs.existsSync(file)) {
          await fsp.unlink(file);
        }
      }
    }

    // atualiza o registro com o caminho do arquivo e o uso diário.
    await updateRecord(id, { status: 'done', resultPath: outTxtPath, dailyUse: dailyUse });
    
    // retorna o caminho para o arquivo .txt que foi salvo.
    return outTxtPath;

  } catch (err) {
    console.error('Erro createTranscriptionAsync:', err);
    await updateRecord(id, { status: 'failed' });
    return null;
  }
}