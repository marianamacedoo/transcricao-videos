import request from 'supertest';
import app from '../src/index';
import { listRecords } from '../src/services/db.service';



// retorna uma lista de transcrições de teste
jest.mock('../src/services/db.service', () => ({
  
  listRecords: jest.fn(() => ([
    { id: '1', originalName: 'audio1.mp3', status: 'done' },
    { id: '2', originalName: 'audio2.mp3', status: 'processing' },
  ])),
}));

// a função 'verifyIdToken' é simulada para sempre retornar um usuário válido
jest.mock('../src/config/firebase.config', () => ({
  auth: () => ({
    // simula uma operação assíncrona bem-sucedida
    verifyIdToken: jest.fn(() => Promise.resolve({
      uid: 'test-user-id',
      email: 'test@example.com'
    })),
  }),
}));



describe('GET /transcriptions', () => {

  it('deve retornar lista de transcrições do usuário autenticado ', async () => {
    // simula uma requisição GET para a rota '/transcriptions'
    const res = await request(app)
      .get('/transcriptions')
      // adiciona um header de autorização para simular um usuário logado
      .set('Authorization', 'Bearer valid-token-here');
      
    // verifica se o status da resposta é 200 (OK)
    expect(res.statusCode).toBe(200);
    // verifica se o corpo da resposta é igual aos dados de teste 
    expect(res.body).toEqual([
      { id: '1', originalName: 'audio1.mp3', status: 'done' },
      { id: '2', originalName: 'audio2.mp3', status: 'processing' },
    ]);
    // garante que a função 'listRecords' foi chamada durante a requisição
    expect(listRecords).toHaveBeenCalled();
  });
});

