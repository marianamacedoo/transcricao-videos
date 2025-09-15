import pool from '../config/db.config';

// tipo registros
type Record = {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  status: 'processing' | 'done' | 'failed';
  resultPath: string | null;
  createdAt: string;
};

// cria um novo registro de transcrição no banco de dados
export async function createRecord(record: any) {
  const queryText = `
    INSERT INTO transcriptions(id, user_id, original_name, filename, status, result_path, created_at)
    VALUES($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [
    record.id,
    record.userId,
    record.originalName,
    record.filename,
    record.status,
    record.resultPath,
    record.createdAt
  ];
  await pool.query(queryText, values);
  return record;
}

// lista os registros de transcrição de um usuário
export async function listRecords(userId: string) {
  const queryText = 'SELECT * FROM transcriptions WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(queryText, [userId]);
  return result.rows;
}

// busca um registro de transcrição específico no banco de dados
export async function getRecord(id: string) {
  const queryText = 'SELECT * FROM transcriptions WHERE id = $1';
  const result = await pool.query(queryText, [id]);
  return result.rows[0] || null;
}


// atualiza um registro de transcrição no banco de dados
export async function updateRecord(id: string, patch: Partial<Record>) {
  const fields = Object.keys(patch).map((key, index) => {
    if (key === 'resultPath') {
      return `result_path = $${index + 2}`;
    }
    return `${key} = $${index + 2}`;
  }).join(', ');

  const values = [id, ...Object.values(patch)];
  const queryText = `UPDATE transcriptions SET ${fields} WHERE id = $1 RETURNING *`;
  const result = await pool.query(queryText, values);
  return result.rows[0] || null;
}