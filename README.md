<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# OmniScale (Vite + React + Gemini)

OmniScale is an AI-assisted powerscaling app for:
- character/entity indexing,
- cross-verse battle simulation, and
- hierarchical tier reference.

## Tech stack
- Vite
- React + TypeScript
- Gemini API (`@google/genai`)

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an env file:
   ```bash
   cp .env.example .env
   ```
3. Set your API key in `.env`:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

If `VITE_GEMINI_API_KEY` is missing, AI actions will show a clear runtime error message.
