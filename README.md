# Orbit Browser

Orbit is a customizable browser for Android and Windows. It combines real web browsing with tabs, workspaces, bookmarks, and appearance controls.

## Desktop first start

The desktop app opens to a focused new tab page with a live clock and date, DuckDuckGo search, and quick links for DuckDuckGo, YouTube, GitHub, Reddit, and Figma. Use the gear button to choose a theme, wallpaper, accent, tab layout, sidebar width, spacing, and corner radius.

## Project layout

- `mobile/` — Expo / React Native app for Android and iOS
- `desktop/` — Electron browser for Windows
- `.github/workflows/release.yml` — builds Android and Windows packages, then publishes a GitHub Release

## Releases

Each push to `main` that changes app or build files runs GitHub Actions. When both build jobs pass, the workflow publishes a release containing an installable Android APK, a portable Windows EXE, and a Windows installer EXE. Open the repository's **Releases** page to download them.

## Local development

- Mobile: `cd mobile`, `npm install`, `npx expo start`
- Desktop: `cd desktop`, `npm install`, `npm start`
