import { Request, Response } from 'express';
import { createRecord, listRecords, getRecord, updateRecord } from '../services/db.service';
import { createTranscriptionAsync } from '../services/transcription.service';
import path from 'path';

// upload do arquivo para transcrição
export const uploadTranscription = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado (campo "file")' });

    // cria registro inicial (status: processing)
    const record = await createRecord({
      filename: req.file.filename,
      originalName: req.file.originalname,
      status: 'processing',
      resultPath: null,
      createdAt: new Date().toISOString()
    });

    // processa em background (não bloqueia a resposta)
    createTranscriptionAsync(record.id, req.file.path)
      .then((resultPath) => updateRecord(record.id, { status: 'done', resultPath }))
      .catch((err) => {
        console.error('Erro ao transcrever:', err);
        updateRecord(record.id, { status: 'failed' });
      });

    // responde 202 Accepted
    return res.status(202).json({ id: record.id, status: record.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no upload' });
  }
};

//lista transcricoes
export const listTranscriptions = async (_req: Request, res: Response) => {
  const list = await listRecords();
  res.json(list);
};

//busca transcricao especifica
export const getTranscriptionById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const record = await getRecord(id);
  if (!record) return res.status(404).json({ error: 'Não encontrado' });
  res.json(record);
};
