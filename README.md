# NITTFest AI Assistant

An AI-powered chat companion for NITTFest — handles event lookups, leaderboard queries, wallet balance queries, and general fest FAQs, built with tool-calling over a Groq-hosted LLM.

## Prerequisites

- Node.js (v18+ recommended)
- npm
- A Groq API key ([console.groq.com](https://console.groq.com))
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated (for OTP email delivery)

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/saaadil/webops_task_1.git
cd webops_task_1

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `backend/` with the following:

```env
PORT=5000
JWT_SECRET=<any long random string>
GROQ_API_KEY=<your Groq API key>
GROQ_MODEL=<Groq model name, e.g. llama-3.3-70b-versatile>
GMAIL_USER=<your Gmail address>
GMAIL_APP_PASSWORD=<your 16-character Gmail App Password>
```

> `.env` is gitignored — never commit real credentials. If you rotate the Gmail App Password, update it here.

The frontend currently points to a hardcoded backend URL (`http://localhost:5000`) in `frontend/src/api/client.js` — no frontend `.env` is required as long as the backend runs on port 5000.

### 3. Run the app

Open two terminals.

**Terminal 1 — backend:**
```bash
cd backend
node server.js
```
You should see: `Server running on port 5000`

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```
Vite will print a local URL, typically `http://localhost:5173`.

Open that URL in your browser.

## Verifying it works

### Signup + OTP flow
1. Go to the signup page, register with a valid `@nitt.edu` email.
2. Check the inbox (or the backend terminal log — OTP is also printed as `[OTP Generated] For <email>: <otp>` for local testing) for the OTP.
3. Enter the OTP to complete signup.
4. Log in with the new credentials.

### Chat + tool-calling
- Ask about events: *"What events are happening today?"*
- Ask about leaderboard: *"What's my department's leaderboard rank?"*
- Ask about wallet: *"What's my wallet balance?"*

### Wallet verification specifically
Wallet balances are matched by `userId` (a UUID assigned at signup), not roll number or email. Mock wallet data lives in `backend/mocks/wallet.json` as an array of entries. To test:
1. Sign up/log in as a user.
2. Find their `userId` in `backend/data/users.json`.
3. Confirm a matching `user_id` exists in `backend/mocks/wallet.json` — if not, the bot will correctly report no wallet data found (expected fallback behavior, not a bug).
4. Ask the chatbot for wallet balance and confirm the number matches the mock entry.

> Note: wallet balances are static mock data. They do **not** reflect live NFPay transactions — spending in the real payment system will not update these numbers. This is intentional for the current mock/demo stage.

## Project Structure

```
backend/
  data/           # Mock user records (users.json)
  mocks/          # Mock wallet, shops, announcements, events data
  llm/            # System prompt construction + tool schema for Groq
  tools/          # Tool implementations (wallet, shops, leaderboard, events)
  routes/         # Express routes (auth, chat)
  middleware/     # JWT auth middleware
  services/       # Email service (OTP delivery)
  server.js       # Entry point

frontend/
  src/
    api/          # API client (backend base URL, fetch wrappers)
    components/   # Chat UI, Login, etc.
    App.jsx       # Root component
```

## Known limitations (mock-data stage)

- Wallet, leaderboard, and events data are static JSON mocks, not live API integrations.
- No admin dashboard yet for managing announcements/knowledge base in real time (planned in later phase).
- Single fest branding/persona; no Tamil/English toggle yet.

## Security notes

- `.env` is gitignored — confirm this before every commit if adding new secrets.
- JWT secret and Gmail App Password must never be committed. If either is accidentally exposed in git history, rotate it immediately and scrub history (e.g. `git filter-repo`) before pushing again.
