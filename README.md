# PeerConnect — Full-stack starter

A full-stack peer-learning and doubt-resolution platform.

## Included
- React + Vite responsive dashboard
- Express API
- MongoDB-backed registration, login, doubts, answers, comments, votes and profile stats
- JWT authentication and bcrypt password hashing
- File uploads (images, PDFs, text and common documents)
- Ollama integration for AI explanations and structured flowchart steps
- YouTube Data API integration when a key is configured; otherwise a real YouTube search link is provided
- No seeded users, sample doubts, fake leaderboard entries or demo credentials

## Requirements
- Node.js 20+
- MongoDB running locally or a MongoDB connection string
- Ollama installed, with a model pulled locally
- Optional: YouTube Data API key

## Setup
See `SETUP-MAC.md` for copy/paste macOS Terminal commands.

## Important notes
- The default Ollama model is `qwen2.5-coder:latest`. Text-only models may not interpret image contents. Uploaded files are stored and attached to the doubt; the student can also enter extracted text. For image understanding, configure a locally installed vision-capable Ollama model in `backend/.env`.
- AI answers are labeled as AI-assisted. Human answers are separately labeled and are never presented as human-written AI output.
- YouTube recommendations are real API results when `YOUTUBE_API_KEY` is configured. Without it, the app shows a YouTube search link for the doubt topic rather than inventing videos.
- Configure strong secrets before deploying publicly. This project is intended for local development until production hardening is completed.
