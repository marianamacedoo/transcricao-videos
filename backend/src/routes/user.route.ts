import { Router } from "express";
import { createUser } from "../controllers/user.controller"; // Crie este controller

const router = Router();
router.post("/", createUser); // Rota para criar usuário
export default router;