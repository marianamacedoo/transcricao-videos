
import { Request, Response } from 'express';
import { createRecord, listRecords, getRecord, updateRecord, getLastTranscriptionByUserId} from '../services/db.service';
import { createTranscriptionAsync, getMediaDuration } from '../services/transcription.service';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// upload do arquivo para transcrição
export const uploadTranscription = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado (campo "file")' });
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
    
    // Supondo que você possa obter a duração do áudio antes de transcrever
    // O código abaixo é um exemplo e deve ser ajustado para a sua real implementação
    const mediaDurationInSeconds = await getMediaDuration(req.file.path);
    const estimatedAudioDurationInMinutes = Math.ceil(mediaDurationInSeconds / 60);

    const newDailyUse = currentDailyUse + estimatedAudioDurationInMinutes;

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
      dailyUse: newDailyUse // Salva o novo uso diário na base
    });

    createTranscriptionAsync(record.id, req.file.path, userId)
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
  res.json(list);
};

// busca transcricao especifica
export const getTranscriptionById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const record = await getRecord(id);
  if (!record) return res.status(404).json({ error: 'Não encontrado' });
  res.json(record);
};