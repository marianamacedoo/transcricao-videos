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
  const [dailyUse, setDailyUse] = useState<number>(0);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const statusMap: { [key: string]: string } = {
    done: 'Pronto',
    processing: 'Processando',
    failed: 'Falhou',
  };

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
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha no upload da transcrição.");
      }

      const data = await response.json();
      setUploadMessage(`Upload realizado com sucesso! ID da transcrição: ${data.id}. Status: ${data.status}`);
      setFile(null);
      setShouldRefresh(true);

      const updatedListResponse = await fetch("http://localhost:4000/transcriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedData = await updatedListResponse.json();
      setTranscriptions(updatedData.transcriptions);
      setDailyUse(updatedData.dailyUse);
    } catch (err: any) {
      setUploadMessage(`Erro: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  // Função para deletar uma transcrição
  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;

    const confirmDelete = window.confirm("Tem certeza que deseja remover esta transcrição?");
    if (!confirmDelete) return;

    const token = await auth.currentUser.getIdToken();

    try {
      const response = await fetch(`http://localhost:4000/transcriptions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao remover a transcrição.");
      }
      
      // Atualiza a lista de transcrições após a exclusão
      const updatedListResponse = await fetch("http://localhost:4000/transcriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedData = await updatedListResponse.json();
      setTranscriptions(updatedData.transcriptions);
      setDailyUse(updatedData.dailyUse);

    } catch (err: any) {
      alert(`Erro: ${err.message}`);
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
        setTranscriptions(data.transcriptions);
        setDailyUse(data.dailyUse);
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
        setShouldRefresh(false);
      }
    });

    return () => unsubscribe();
  }, [shouldRefresh]);

  const filteredTranscriptions = transcriptions.filter(t =>
    t.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || loading) return <p className="text-center mt-8 text-gray-600">Carregando...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Erro: {error}</p>;

  const MAX_DAILY_USE = 60;
  const isQuotaExceeded = dailyUse >= MAX_DAILY_USE;

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
        {/* Adicione o card com o limite diário */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Uso Diário</h2>
          <p className="text-gray-600">
            Você já utilizou <span className="font-bold">{dailyUse.toFixed(2)}</span> de 60 minutos.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(dailyUse / 60) * 100}%` }}></div>
          </div>
        </section>
        {/* Seção para o formulário de upload */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Solicitar Nova Transcrição</h2>
          {isQuotaExceeded ? (
            <p className="text-red-500 font-bold text-center">
              Limite diário de 60 minutos excedido.
            </p>
          ) : (
            <form onSubmit={handleUpload} className="flex flex-col items-center">
              <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <p className="text-gray-500 font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="mb-2 text-sm text-gray-500 font-semibold">
                        <span className="font-bold text-blue-600 hover:underline">Clique para fazer upload</span>
                      </p>
                      <p className="text-xs text-gray-500">MP3, MP4 (MAX. 500MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>

              <button
                type="submit"
                disabled={uploading || !file}
                className={`mt-4 w-1/2 py-2 px-4 rounded-lg font-bold
                  ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
                `}
              >
                {uploading ? "Enviando..." : "Enviar para Transcrever"}
              </button>
            </form>
          )}
          {uploadMessage && (
            <p className="mt-4 text-center text-sm font-semibold">
              {uploadMessage}
            </p>
          )}
        </section>

        {/* Seção para a lista de transcrições com barra de pesquisa */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Minhas Transcrições</h2>
            <input
              type="text"
              placeholder="Pesquisar por nome do arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {filteredTranscriptions.length > 0 ? (
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
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTranscriptions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {t.original_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {statusMap[t.status] || t.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center space-x-2">
                        {t.status === "done" && (
                          <>
                            <a href={`http://localhost:4000/uploads/${t.id}.txt`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                              Download
                            </a>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1 rounded-full text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                              aria-label="Remover transcrição"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 3a1 1 0 100 2h-6a1 1 0 100-2h6z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
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