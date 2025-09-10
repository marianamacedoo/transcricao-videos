import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pingRoute from './routes/ping.route';
import transcriptionsRoute from './routes/transcriptions.route';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// garante pastas
const uploadsPath = path.resolve(__dirname, '../uploads');
const dataPath = path.resolve(__dirname, '../data');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

app.use(cors());
app.use(express.json());

// servir arquivos enviados (opcional)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// rotas
app.use('/ping', pingRoute);
app.use('/transcriptions', transcriptionsRoute);


app.get('/', (req, res) => {
  res.status(200).send('API de Transcrição de Vídeos está no ar!');
});

app.listen(PORT, () => {
  console.log(` Backend rodando em http://localhost:${PORT}`);
});

