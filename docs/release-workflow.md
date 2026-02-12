# Release Workflow

This document explains how the GitHub Actions workflow automatically builds and publishes executables when a tag is created.

## Overview

When a tag matching the pattern `v*` is pushed to the repository, the workflow automatically:
1. Builds the API, web app, and Electron app
2. Packages Linux executable (AppImage)
3. Creates a GitHub Release and uploads the executables

## Workflow File

The workflow is defined in `.github/workflows/release.yml`.

## How It Works

### Trigger

The workflow triggers on tag push:
```yaml
on:
  push:
    tags:
      - 'v*'
```

### Build Process

1. **Setup**: Installs Node.js 24.13.0 and pnpm 9.15.0
2. **Cache**: Caches pnpm store for faster builds
3. **Install**: Installs dependencies for API, web, and electron
4. **Build**: Compiles TypeScript for API, web, and electron
5. **Package**: Uses electron-builder to create Linux executables

### Packaging

The `electron-builder` configuration in `src/electron/package.json` includes:
- `files`: Includes `dist/**` (Electron build output)
- `extraFiles`: Includes API and web builds:
  - `../../api/dist` → `src/api/dist`
  - `../../web/dist` → `src/web/dist`

### Path Resolution

The Electron app detects if it's packaged using `app.isPackaged`:
- **Development**: PROJECT_ROOT is `src/electron/dist/../../..` (project root)
- **Packaged**: PROJECT_ROOT is `resources/app/` (one level up from `dist/`)

This ensures the app can find the API and web builds in both modes.

### Release Creation

After building, the workflow:
1. Downloads the AppImage artifact
2. Extracts the tag name from `GITHUB_REF`
3. Creates a GitHub Release with the executables attached

## Creating a Release

To create a new release:

1. **Ensure code is ready**: Make sure all changes are committed and pushed
2. **Create and push a tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. **Monitor the workflow**: Check the Actions tab in GitHub to see the build progress
4. **Verify the release**: Once complete, check the Releases page for your new release

## Current Status

- ✅ Linux AppImage
- ⏳ Windows NSIS (configured but not in workflow yet)
- ⏳ macOS DMG (configured but not in workflow yet)

## Future Enhancements

To add Windows and macOS builds:
1. Add new jobs for `build-windows` and `build-mac`
2. Use `runs-on: windows-latest` and `runs-on: macos-latest`
3. Run `electron-builder --win` and `electron-builder --mac`
4. Upload artifacts and include them in the release
