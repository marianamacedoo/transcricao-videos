import request from 'supertest';
import app from '../src/index'; 
import admin from '../src/config/firebase.config';

// faz um mock do Firebase Admin SDK para simular a verificação de um token válido
jest.mock('../src/config/firebase.config', () => ({
  auth: () => ({
    verifyIdToken: jest.fn(() => ({
      uid: 'usuario-de-teste-id',
      email: 'teste@example.com'
    })),
  }),
}));

describe('Middleware de Autenticação', () => {
  it('deve retornar 401 se nenhum token for fornecido', async () => {
    const res = await request(app).get('/transcriptions');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token não fornecido');
  });

  it('deve permitir acesso com um token válido', async () => {
    const res = await request(app)
      .get('/transcriptions')
      .set('Authorization', 'Bearer token-valido-aqui');
    
    // verifica se a lógica da rota foi executada (espera-se um 200 ou 202, mas não 401)
    expect(res.statusCode).not.toBe(401);
  });
});
