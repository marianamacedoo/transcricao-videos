import { Request, Response } from 'express';

// conexões do banco de dados
import pool from '../config/db.config';

// função para criar um novo usuário no banco de dados
export async function createUser(req: Request, res: Response) {
  try {
    // pega o userId e o email do corpo da requisição
    const { userId, email } = req.body;

    // inserir um novo usuário
    const queryText = `
      INSERT INTO users(id, email)
      VALUES($1, $2)
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;
    const values = [userId, email];

    // executa a query no banco de dados
    await pool.query(queryText, values);

    return res.status(201).json({ message: 'Usuário salvo com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao salvar usuário' });
  }
}