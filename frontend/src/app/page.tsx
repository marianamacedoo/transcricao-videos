"use client"; // necessário para usar useState no App Router

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<string | null>(null);

  if (user) {
    return (
      <div>
        <h1>Bem-vindo, {user}</h1>
        <a href="/dashboard">Ir para Dashboard</a>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setUser(email); // depois trocamos para Firebase
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Digite seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
