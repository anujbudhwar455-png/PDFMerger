# PDF Merger — GitHub Pages (legal site)

Static site for Play Console privacy / terms URLs and app info.

## Public URLs (after publish)

- https://anujbudhwar455-png.github.io/PDFMerger/
- https://anujbudhwar455-png.github.io/PDFMerger/privacy-policy.html
- https://anujbudhwar455-png.github.io/PDFMerger/terms-and-conditions.html

## Files

| File | Purpose |
|------|---------|
| `index.html` | Home — app blurb, links to legal pages, contact |
| `privacy-policy.html` | Full privacy policy (on-device PDFs, AdMob, Play Billing) |
| `terms-and-conditions.html` | Terms & conditions |

Effective / last updated: **September 15, 2026**.

## Publish to `anujbudhwar455-png/PDFMerger`

1. Create a public GitHub repo named **`PDFMerger`** under the account **`anujbudhwar455-png`** (if it does not exist yet).
2. Push the contents of this folder (`github-pages/`) to the **`main`** branch **root** (not a `/docs` subfolder):
   - `index.html`
   - `privacy-policy.html`
   - `terms-and-conditions.html`
   - (optional) this `README.md`
3. In the repo: **Settings → Pages**
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Save and wait a minute or two for GitHub Pages to build.
5. Verify the three URLs above load correctly.
6. In Google Play Console, set Privacy Policy URL to:
   `https://anujbudhwar455-png.github.io/PDFMerger/privacy-policy.html`

### Example git commands (from this folder)

```bash
cd /path/to/github-pages
git init
git add index.html privacy-policy.html terms-and-conditions.html README.md
git commit -m "Add PDF Merger GitHub Pages legal site"
git branch -M main
git remote add origin https://github.com/anujbudhwar455-png/PDFMerger.git
git push -u origin main
```

Then enable Pages as described above.

## Notes

- Do **not** claim “no ads / no SDKs” — the app uses AdMob and Google Play Billing.
- Contact: anujbudhwar455@gmail.com · Desrein Studios
