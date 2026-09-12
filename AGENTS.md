# AGENTS.md

## Project Context

This is FlagAtlas - a standalone React web application for learning world flags. Keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup and development workflow.

## Key Files

- `src/`: frontend application source.
- `vite.config.js`: Vite configuration.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for local development.
- Use `npm run build` to create production builds.
- All data persists in browser localStorage - no external dependencies.
- Run the relevant checks from `package.json` before finishing code changes.
