"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        window.location.href = "/";
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, []);

  async function mostrarToken() {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      console.log("TOKEN JWT:", token);
      alert("Token exibido no console do navegador!");
    }
  }

  if (!user) return <p className="text-center mt-8 text-gray-600">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Bem-vindo, {user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Botão de demonstração para pegar o token */}
        <div className="mb-8 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          <p className="text-sm font-semibold">
            Clique no botão abaixo para obter o token de autenticação no console do navegador
          </p>
          <button
            onClick={mostrarToken}
            className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-1 px-3 rounded-lg focus:outline-none"
          >
            Mostrar Token no Console
          </button>
        </div>

        {/* Seção para o formulário de upload (próxima etapa) */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Solicitar Nova Transcrição</h2>
          {/* Aqui você vai adicionar o formulário de upload de arquivos */}
          <p className="text-gray-500"> formulário para upload de arquivos de áudio/vídeo</p>
        </section>

        {/* Seção para a lista de transcrições (próxima etapa) */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Transcrições</h2>
          {/* Aqui você vai adicionar a lógica para listar as transcrições do backend */}
          <p className="text-gray-500">lista de transcrições</p>
        </section>

      </div>
    </div>
  );
}