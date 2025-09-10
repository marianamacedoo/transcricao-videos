import { Router } from "express";
import { upload } from "../services/upload.service";
import * as controller from "../controllers/transcription.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// só permite se usuário logado (token válido)
router.post("/", verifyToken, upload.single("file"), controller.uploadTranscription);
router.get("/", verifyToken, controller.listTranscriptions);
router.get("/:id", verifyToken, controller.getTranscriptionById);

export default router;
