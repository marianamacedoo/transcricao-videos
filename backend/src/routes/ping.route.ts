import { Router } from 'express';
import { ping } from '../controllers/ping.controller';

// cria objeto de rota
const router = Router();
router.get('/', ping);
export default router;
