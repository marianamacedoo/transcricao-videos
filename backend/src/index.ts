import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pingRoute from './routes/ping.route';
import transcriptionsRoute from './routes/transcriptions.route';
import userRoute from './routes/user.route';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

dotenv.config();

// inicializa servidor Express e define porta
const app = express();
const PORT = process.env.PORT || 4000;

// garante pastas de uploads
const uploadsPath = path.resolve(__dirname, '../uploads');
const dataPath = path.resolve(__dirname, '../data');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

// middleware CORS para permitir requisicoes
app.use(cors());

// express aceita requisicoes JSON
app.use(express.json());

// acesso a pasta uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// rotas 
app.use('/ping', pingRoute);
app.use('/transcriptions', transcriptionsRoute);

//rota teste
app.get('/', (req, res) => {
  res.status(200).send('API de Transcrição de Vídeos está no ar!');
});

// inicia servidor
app.listen(PORT, () => {
  console.log(` Backend rodando em http://localhost:${PORT}`);
});

app.use('/users', userRoute);

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default app;