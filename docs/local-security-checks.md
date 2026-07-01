# Local Security Checks

Run the repeatable local check before publishing JUON site changes:

```powershell
npm run check:site
```

The command verifies:

- TypeScript and production build via `npm run build`.
- Production dependency audit via `npm audit --omit=dev`.
- Static security headers in `public/_headers`.
- Dangerous browser APIs such as `dangerouslySetInnerHTML`, direct `innerHTML`, `eval`, storage, cookie access, and `fetch`.
- No PDF files are bundled under `public/` or `dist/`.
- High-risk routes render in desktop and mobile Playwright checks without horizontal overflow.
- `#/consult?type=foo` normalizes back to `#/consult`.
- External blank-target links use `rel="noreferrer"` or `rel="noopener"`.
- `#/contact` and `#/consult` do not expose local personal-information forms.
- `#/voices` keeps local PDF links and downloads out of the visitor flow.
