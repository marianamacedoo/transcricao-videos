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

  if (!user) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Usuário logado: {user.email}</p>
      <button onClick={() => signOut(auth)}>Sair</button>
      <button onClick={mostrarToken}>Mostrar Token no Console</button>
    </div>
  );
}
