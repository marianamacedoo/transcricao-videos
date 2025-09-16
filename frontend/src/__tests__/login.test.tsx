import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../app/page';

// Mocka a navegação para que o teste não tente redirecionar a página
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

// Mocka as funções do Firebase para que o teste não precise de autenticação real
jest.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
    user: { email: 'test@example.com' },
  })),
}));

describe('Página de Login', () => {
  it('deve renderizar o formulário de login com todos os campos e botões', () => {
    render(<Login />);
    
    // Verifica se os elementos de texto e input estão presentes
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite seu email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite sua senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/Não tem conta?/i)).toBeInTheDocument();
  });
  
  it('deve chamar a função de login do Firebase ao submeter o formulário', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    render(<Login />);

    // Simula a entrada de dados do usuário
    fireEvent.change(screen.getByPlaceholderText(/Digite seu email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Digite sua senha/i), {
      target: { value: 'password123' },
    });
    
    // Simula o clique no botão de login
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    
    // Espera que a função do Firebase tenha sido chamada com os valores corretos
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
  });
});