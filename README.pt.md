<p align="right"><a href="README.md">🇺🇸 English</a> · 🇧🇷 Português</p>

# 🎬 Video Transcription Fullstack App

## 📝 Visão Geral
Este projeto é uma aplicação **full-stack** desenvolvida para **transcrever áudios e vídeos**.  
O sistema lida com **upload assíncrono**, **autenticação de usuários**, **controle de cotas diárias** e **armazenamento de dados** em um **banco de dados relacional**, tudo com uma interface moderna e intuitiva.

---

## ✨ Funcionalidades

- 🔐 **Autenticação Segura** – Login e cadastro via **Firebase Authentication**
- ⚡ **Processamento Assíncrono** – Transcrição em segundo plano para respostas rápidas
- 📂 **Divisão de Arquivos Grandes** – Suporte a arquivos maiores que **25MB**, divididos em partes
- ⏱️ **Controle de Cotas** – Limite de **60 minutos de transcrição por dia** por usuário
- 📊 **Dashboard Intuitivo** – Visualização do status e download do arquivo **.txt**
- 🧩 **Arquitetura Modular** – Backend em **Node.js + Express** (controllers, services, routes)
- 💻 **Interface Moderna** – Frontend em **Next.js + React** com **Tailwind CSS**

---

## 🛠️ Tecnologias e Ferramentas

### 🔙 Backend
- **Node.js** – Ambiente de execução
- **Express** – Criação da API
- **PostgreSQL** – Banco de dados relacional
- **Firebase Admin SDK** – Validação de tokens e gerenciamento de usuários
- **Multer** – Middleware para upload de arquivos
- **Fluent-ffmpeg** – Manipulação e divisão de áudio/vídeo
- **OpenAI Transcriptions API** – Serviço de transcrição

### 🔝 Frontend
- **Next.js** – Framework React para UI
- **React** – Biblioteca de componentes
- **Firebase SDK** – Autenticação no cliente
- **Tailwind CSS** – Estilização rápida e responsiva

