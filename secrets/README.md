DO NOT commit real secrets into the repository.

This folder is a local-only helper for storing environment files during development.

Recommended workflow:

- Add your secret to `./.env.local` at the project root (this file is already in `.gitignore`).
- Or, better, add the key as a GitHub secret named `AI_GATEWAY_API_KEY` and/or as a Vercel Project Environment Variable.

Example `.env.local` entries (DO NOT COMMIT):

AI_GATEWAY_API_KEY=your_real_api_key_here
AI_GATEWAY_URL=https://api.yourgateway.example/v1/generate

If you choose to keep a local file here for convenience, name it `.env.local` and keep it out of git.

Security reminder: revoke and rotate keys that were accidentally shared in chat or commit history.
