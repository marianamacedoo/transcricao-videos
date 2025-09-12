// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Novos estados para o formulário de upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Função para lidar com o upload do arquivo
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !auth.currentUser) return;

    setUploading(true);
    setUploadMessage(null);

    const token = await auth.currentUser.getIdToken();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:4000/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha no upload da transcrição.");
      }

      const data = await response.json();
      setUploadMessage(`Upload realizado com sucesso! ID da transcrição: ${data.id}. Status: ${data.status}`);
      setFile(null); // Limpa o arquivo selecionado

      const updatedListResponse = await fetch("http://localhost:4000/transcriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedData = await updatedListResponse.json();
      setTranscriptions(updatedData);

    } catch (err: any) {
      setUploadMessage(`Erro: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchTranscriptions = async (token: string) => {
      try {
        const response = await fetch("http://localhost:4000/transcriptions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar transcrições");
        }

        const data = await response.json();
        setTranscriptions(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        window.location.href = "/";
      } else {
        setUser(u);
        const token = await u.getIdToken();
        fetchTranscriptions(token);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user || loading) return <p className="text-center mt-8 text-gray-600">Carregando...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Erro: {error}</p>;

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

        {/* Seção para o formulário de upload */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Solicitar Nova Transcrição</h2>
          <form onSubmit={handleUpload}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className={`mt-4 w-full py-2 px-4 rounded-lg font-bold
                ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
              `}
            >
              {uploading ? "Enviando..." : "Enviar para Transcrever"}
            </button>
          </form>
          {uploadMessage && (
            <p className="mt-4 text-center text-sm font-semibold">
              {uploadMessage}
            </p>
          )}
        </section>

        {/* Seção para a lista de transcrições */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Transcrições</h2>
          {transcriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome do Arquivo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transcrição
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transcriptions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {t.originalName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {t.status === "done" && (
                          <a href={`http://localhost:4000/uploads/${t.id}.txt`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma transcrição encontrada.</p>
          )}
        </section>
      </div>
    </div>
  );
}