import { Router } from 'express';
import { upload } from '../services/upload.service';
import * as controller from '../controllers/transcription.controller';

const router = Router();

// upload de um arquivo: campo "file"
router.post('/', upload.single('file'), controller.uploadTranscription);

// listar todas solicitações (protótipo)
router.get('/', controller.listTranscriptions);

// obter transcrição por id
router.get('/:id', controller.getTranscriptionById);

export default router;
