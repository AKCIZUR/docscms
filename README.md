# DocsFuma GitHub Pages Ready

Plně připravená verze pro GitHub Pages.

## Instalace

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages Deploy

1. Vytvoř nový GitHub repozitář
2. Nahraj obsah projektu
3. Pushni do větve `main`
4. V GitHub:
   - Settings → Pages
   - Source → GitHub Actions

Workflow automaticky:
- nainstaluje dependencies
- vytvoří static export
- publikuje web na GitHub Pages

## Lokální preview exportu

```bash
npm run build
npx serve out
```
