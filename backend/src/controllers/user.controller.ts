// Importa tipos do Express para requisições e respostas.
import { Request, Response } from 'express';

// Importa o Pool de conexões do banco de dados.
import pool from '../config/db.config';

// Função para criar um novo usuário no banco de dados.
export async function createUser(req: Request, res: Response) {
  try {
    // Pega o userId e o email do corpo da requisição.
    const { userId, email } = req.body;

    // Comando SQL para inserir um novo usuário.
    // O comando "ON CONFLICT DO NOTHING" garante que um usuário
    // seja criado apenas uma vez, evitando erros caso o frontend
    // envie a requisição duas vezes.
    const queryText = `
      INSERT INTO users(id, email)
      VALUES($1, $2)
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;
    const values = [userId, email];

    // Executa a query no banco de dados.
    await pool.query(queryText, values);

    // Retorna uma resposta de sucesso.
    return res.status(201).json({ message: 'Usuário salvo com sucesso.' });
  } catch (err) {
    // Em caso de erro, retorna uma resposta de erro no servidor.
    console.error(err);
    return res.status(500).json({ error: 'Erro ao salvar usuário' });
  }
}