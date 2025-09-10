import path from 'path';
import fs from 'fs/promises';
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

export async function createRecord(partial: Omit<Record, 'id'>) {
  const db = await readDB();
  const rec: Record = { id: uuidv4(), ...partial };
  db.push(rec);
  await writeDB(db);
  return rec;
}

export async function listRecords() {
  return await readDB();
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
