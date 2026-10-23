<p align="right">🇺🇸 English · <a href="README.pt.md">🇧🇷 Português</a></p>

# 🎬 Video Transcription Fullstack App

## 📝 Overview
This project is a **full-stack** application developed for **transcribing audio and video**.  
The system handles **asynchronous uploads**, **user authentication**, **daily quota control**, and **data storage** in a **relational database**, all wrapped in a modern and intuitive interface.

---

## ✨ Features

- 🔐 **Secure Authentication** – Login and signup via **Firebase Authentication**
- ⚡ **Asynchronous Processing** – Background transcription for fast responses
- 📂 **Large File Splitting** – Support for files larger than **25MB**, split into parts
- ⏱️ **Quota Control** – Limit of **60 minutes of transcription per day** per user
- 📊 **Intuitive Dashboard** – Status visualization and **.txt** file download
- 🧩 **Modular Architecture** – Backend in **Node.js + Express** (controllers, services, routes)
- 💻 **Modern Interface** – Frontend in **Next.js + React** with **Tailwind CSS**

---

## 🛠️ Technologies & Tools

### 🔙 Backend
- **Node.js** – Runtime environment
- **Express** – API creation
- **PostgreSQL** – Relational database
- **Firebase Admin SDK** – Token validation and user management
- **Multer** – Middleware for file uploads
- **Fluent-ffmpeg** – Audio/video manipulation and splitting
- **OpenAI Transcriptions API** – Transcription service

### 🔝 Frontend
- **Next.js** – React framework for UI
- **React** – Component library
- **Firebase SDK** – Client-side authentication
- **Tailwind CSS** – Fast and responsive styling
