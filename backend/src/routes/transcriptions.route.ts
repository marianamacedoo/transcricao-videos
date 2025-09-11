import { Router } from "express";
import { upload } from "../services/upload.service";
import * as controller from "../controllers/transcription.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// rota POST, verifica token e processa arquivo
router.post("/", verifyToken, upload.single("file"), controller.uploadTranscription);

// lista transcricoes
router.get("/", verifyToken, controller.listTranscriptions);

// detalha transição
router.get("/:id", verifyToken, controller.getTranscriptionById);

export default router;
