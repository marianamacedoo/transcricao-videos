
import { Request, Response } from 'express';
import { createRecord, listRecords, getRecord, updateRecord, getLastTranscriptionByUserId, getDailyUse, deleteRecord} from '../services/db.service';
import { createTranscriptionAsync, getMediaDuration } from '../services/transcription.service';
import { createLargeTranscriptionAsync } from '../services/largeFile.service';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// upload do arquivo para transcrição
export const uploadTranscription = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado (campo "file")' });
    }

    // lista de extensões de arquivos de mídia permitidas
    const allowedExtensions = ['.mp3', '.mp4'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // verifica se a extensão do arquivo é permitida
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: 'Formato de arquivo inválido.' });
    }

    const userId = (req as any).user.uid;
    const transcriptionId = uuidv4();

    // Inicia o processo de verificação da cota
    let currentDailyUse = 0;
    const lastTranscription = await getLastTranscriptionByUserId(userId);
    const today = new Date();

    if (lastTranscription && new Date(lastTranscription.created_at).toLocaleDateString() === today.toLocaleDateString()) {
        currentDailyUse = lastTranscription.daily_use;
    }
    
    
    const mediaDurationInSeconds = await getMediaDuration(req.file.path);
    const estimatedAudioDurationInMinutes = mediaDurationInSeconds / 60;
    console.log('Duração do áudio:', mediaDurationInSeconds, 'segundos');

    const newDailyUse = currentDailyUse + estimatedAudioDurationInMinutes;
    console.log('Duração do áudio:', estimatedAudioDurationInMinutes, 'minutos');

    // Verifica se a cota de 60 minutos será excedida
    if (newDailyUse > 60) {
        return res.status(403).json({ error: 'Não foi possível fazer a transcrição. Ultrapassa limite diário de 60 minutos.' });
    }

    const record = await createRecord({
      id: transcriptionId,
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      status: 'processing',
      resultPath: null,
      createdAt: new Date().toISOString(),
      dailyUse: newDailyUse 

    });
    const fileSizeInBytes = req.file.size;
    const maxFileSize = 25 * 1024 * 1024; // 25MB em bytes

    createTranscriptionAsync(record.id, req.file.path, newDailyUse)
      .then((resultPath) => updateRecord(record.id, { status: 'done', resultPath }))
      .catch((err) => {
        console.error('Erro ao transcrever:', err);
        updateRecord(record.id, { status: 'failed' });
      });

    return res.status(202).json({ id: record.id, status: record.status });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no upload' });
  }
};

// lista transcricoes
export const listTranscriptions = async (req: Request, res: Response) => {
  // pega o ID do usuário para filtrar as transcrições.
  const userId = (req as any).user.uid;
  const list = await listRecords(userId);
  const dailyUse = await getDailyUse(userId); // busca o uso diário
  res.json({ transcriptions: list, dailyUse: dailyUse });
};

// busca transcricao especifica
export const getTranscriptionById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const record = await getRecord(id);
  if (!record) return res.status(404).json({ error: 'Não encontrado' });
  res.json(record);
};

// deleta transcricao
export const deleteTranscription = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    
    // Busca o registro para obter o caminho do arquivo
    const record = await getRecord(id);
    if (!record) {
      return res.status(404).json({ error: "Transcrição não encontrada." });
    }

    // Deleta o arquivo da pasta 'uploads' se ele existir
    const filePath = record.result_path;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await deleteRecord(id);
    res.status(204).send(); // Resposta sem conteúdo para sucesso
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar transcrição" });
  }
};
