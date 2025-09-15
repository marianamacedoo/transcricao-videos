import { Router } from "express";
import { createUser } from "../controllers/user.controller"; 

const router = Router();
router.post("/", createUser); // rota para criar usuário
export default router;