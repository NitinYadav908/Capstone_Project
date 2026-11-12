# PeerConnect — macOS setup

## 1. Extract
Download `PeerConnect-Full.zip` to `~/Downloads`, then run:

```bash
mkdir -p ~/Projects
unzip -o ~/Downloads/PeerConnect-Full.zip -d ~/Projects
cd ~/Projects/PeerConnect
```

## 2. Check tools
```bash
node -v
npm -v
mongod --version
ollama --version
```

MongoDB must be running. If installed with Homebrew:
```bash
brew services start mongodb-community
```
If the service name differs on your Mac, check:
```bash
brew services list
```

Ollama:
```bash
ollama serve
```
Run that in a separate terminal if Ollama is not already running. In another terminal:
```bash
ollama pull qwen2.5-coder:latest
ollama list
```

## 3. Configure backend
```bash
cd ~/Projects/PeerConnect/backend
cp .env.example .env
```
The defaults expect MongoDB on `127.0.0.1:27017` and Ollama on `127.0.0.1:11434`.
Edit `.env` if your ports or model differ. Set a long random `JWT_SECRET`.
Optional: add your YouTube Data API key as `YOUTUBE_API_KEY`.

## 4. Install dependencies
```bash
cd ~/Projects/PeerConnect/backend
npm install

cd ~/Projects/PeerConnect/frontend
npm install
```

## 5. Run backend
Terminal 1:
```bash
cd ~/Projects/PeerConnect/backend
npm run dev
```
Health check:
```bash
curl http://127.0.0.1:5001/api/health
```

## 6. Run frontend
Terminal 2:
```bash
cd ~/Projects/PeerConnect/frontend
npm run dev
```
Open `http://127.0.0.1:5173`.

## 7. First use
1. Register your own account.
2. Log in.
3. Ask a doubt and optionally attach a file.
4. Generate an AI explanation (Ollama must be running).
5. Add a human answer from another registered account.
6. Configure `YOUTUBE_API_KEY` for YouTube Data API results.

## Troubleshooting
- Mongo connection error: start MongoDB and confirm `MONGODB_URI`.
- Ollama connection error: start Ollama, check `ollama list`, and verify `OLLAMA_MODEL`.
- Port busy: change `PORT` in backend `.env` or Vite's `server.port` in `frontend/vite.config.js`.
- `code` command missing: open VS Code, use File → Open Folder, then select `~/Projects/PeerConnect`.
