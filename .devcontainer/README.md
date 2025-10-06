# Shoppilot Dev Container

Ambiente remoto per GitHub Codespaces.

- Node.js 20 (LTS)
- NPM + Corepack abilitato
- ESLint, Prettier, TailwindCSS e Prisma configurati
- Porta 3000 forward automatica per `npm run dev`
- Estensioni VS Code consigliate già installate

## Avvio
1. Apri il repo in Codespace (Code → Codespaces → Create)
2. Premi **Ctrl+Shift+P** e scegli “Rebuild and Reopen in Container”
3. Dopo il rebuild:
   ```bash
   npm run dev
