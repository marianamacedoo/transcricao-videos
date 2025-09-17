Video Transcription Fullstack App
<p align="center">
<img src="https://livenbr.com/wp-content/uploads/2023/12/logo-liven-black-768x312.png" alt="Logo do Projeto" width="300"/>
</p>

📝 Visão Geral do Projeto
Esta é uma aplicação full-stack desenvolvida para transcrever áudios e vídeos. O projeto lida com a submissão assíncrona de arquivos de mídia, autenticação de usuários, controle de cotas de uso diário e armazenamento de dados em um banco de dados relacional.

✨ Funcionalidades
Autenticação Segura: Login e cadastro de usuários utilizando Firebase Authentication.

Processamento Assíncrono: Transcrição de arquivos de mídia em segundo plano, garantindo uma resposta rápida para o usuário.

Divisão de Arquivos Grandes: Lógica para processar arquivos maiores que 25MB, dividindo-os em pedaços e transcrevendo-os individualmente.

Controle de Cotas: Limite de uso diário de 60 minutos de transcrição por usuário.

Visualização e Download: Dashboard intuitivo para visualizar o status das transcrições e baixar o arquivo .txt quando estiver pronto.

Arquitetura Modular: Backend construído com Node.js e Express, seguindo o padrão de design em camadas (controllers, services, routes).

Interface Intuitiva: Frontend desenvolvido com Next.js e React, utilizando Tailwind CSS para um design responsivo e moderno.

🛠️ Tecnologias e Ferramentas
Backend:

Node.js: Ambiente de execução para o backend.

Express: Framework web para a criação da API.

PostgreSQL: Banco de dados relacional para armazenar dados de usuários e transcrições.

Firebase Admin SDK: Para validação de tokens e gerenciamento de usuários.

Multer: Middleware para lidar com o upload de arquivos.

Fluent-ffmpeg: Biblioteca para manipular e dividir arquivos de áudio/vídeo.

OpenAI Transcriptions API: Serviço de transcrição de áudio e vídeo.

Frontend:

Next.js: Framework React para a interface do usuário.

React: Biblioteca para a construção de componentes.

Firebase SDK: Para login e cadastro de usuários no lado do cliente.

Tailwind CSS: Para a estilização rápida e responsiva.
