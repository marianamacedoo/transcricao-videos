import path from 'path';
import fs from 'fs/promises';
import pool from '../config/db.config';
import { v4 as uuidv4 } from 'uuid';

const DB_FILE = path.resolve(__dirname, '../../data/transcriptions.json');

type Record = {
  id: string;
  filename: string;
  originalName: string;
  status: 'processing' | 'done' | 'failed';
  resultPath: string | null;
  createdAt: string;
};

async function readDB(): Promise<Record[]> {
  try {
    const txt = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(txt) as Record[];
  } catch {
    return [];
  }
}

async function writeDB(data: Record[]) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function createRecord(record: any) {
  const queryText = `
    INSERT INTO transcriptions(id, user_id, original_name, filename, status, result_path, created_at)
    VALUES($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [
    record.id,
    record.userId, // Adiciona o valor do userId
    record.originalName,
    record.filename,
    record.status,
    record.resultPath,
    record.createdAt
  ];
  await pool.query(queryText, values);
  return record;
}

export async function listRecords(userId: string) {
  const queryText = 'SELECT * FROM transcriptions WHERE user_id = $1';
  const result = await pool.query(queryText, [userId]);
  return result.rows;
}

export async function getRecord(id: string) {
  const db = await readDB();
  return db.find((r) => r.id === id) ?? null;
}

export async function updateRecord(id: string, patch: Partial<Record>) {
  const db = await readDB();
  const idx = db.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db[idx] = { ...db[idx], ...patch };
  await writeDB(db);
  return db[idx];
}

