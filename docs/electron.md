# Desktop app (Electron)

The desktop app packages the same API and web UI as an installable application. The Electron main process starts the Fastify server and opens a window to `http://localhost:PORT`. The server listens on `0.0.0.0`, so other devices on the network can access the app using the URL shown on the setup page (toast).

## Structure

Code lives under `src/electron/`. TypeScript source is in `src/electron/src/` with subfolders:

- **config/** – `paths.ts`: resolves `userData`, database path, `DATA_PATH`, and `PUBLIC_PATH` (web build). Single place for app data locations.
- **server/** – `apiServer.ts`: imports and starts the API (from the built API). Receives config (port, paths) and returns `{ app, port }`. No Electron dependency.
- **window/** – `appWindow.ts`: creates and configures `BrowserWindow` (URL, `webPreferences`: `nodeIntegration: false`, `contextIsolation: true`).
- **main.ts** – Entry point; orchestrates: resolve paths → start server → create window. Handles app quit and window closed (close server, exit).

The API is started programmatically via `startServer()` exported from `src/api/src/startServer.ts`. The standalone CLI entry `src/api/src/server.ts` calls the same function.

## Running in development

**Recommended:** from the project root, run:

```bash
make dev
```

This installs dependencies (api, web, electron), builds all three, runs the database migration, and starts Electron. See [development.md](development.md) for other Makefile targets (`make help`, `make setup`, etc.).

**Manual steps:** if you prefer not to use the Makefile:

1. Build the API and web app (from project root):

```bash
cd src/api && pnpm run build
cd ../web && pnpm run build
```

2. Run Electron from the `src/electron/` folder (current working directory must be project root so that the API and web paths resolve):

```bash
cd src/electron
pnpm install
pnpm run build
pnpm run dev
```

When you run `electron .`, the main process resolves the project root as `join(__dirname, '..', '..', '..')` (relative to `src/electron/dist/main.js`). Ensure you are in the project root when starting Electron so that `src/api/dist` and `src/web/dist` exist and are found.

## Building installers

From `src/electron/`, run the electron-builder pack script (e.g. `pnpm run build` or `pnpm run package`). Targets: Linux (deb, AppImage), Windows (nsis or portable), macOS (dmg/pkg). Configuration is in `src/electron/package.json` under the `build` key (`appId`, `productName`, `files`, etc.).

Before packaging, ensure the API and web builds are up to date; the packaged app includes `dist` from the API and `src/web/dist`.

## Lint and standards

The same code standards as the rest of the project apply to `src/electron/`. Run ESLint in `src/electron/` before committing. See [coding-standards.md](coding-standards.md).
