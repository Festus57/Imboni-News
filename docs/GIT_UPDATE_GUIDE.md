# Updating your existing GitHub project with the corrected files

The corrected ZIP intentionally does **not** include `.git`, `node_modules`, build output or a real `.env` file.

1. Make a backup of your current `Imboni-News` folder.
2. Extract `Imboni-News-Corrected.zip` to a temporary location.
3. Open your existing local `Imboni-News` folder (the one that already contains `.git`).
4. Copy the corrected `server`, `client`, `admin`, `docs`, `README.md` and `.gitignore` into the existing folder and allow files to be replaced. **Do not delete or replace the existing `.git` folder.**
5. Keep your existing `server/.env` private. Compare it with the new `server/.env.example`; add missing settings manually and rotate any secrets that were exposed. Create `client/.env` and `admin/.env` from their examples if required for your hosting setup.
6. In each of `server`, `client` and `admin`, run `npm ci` after confirming you have an internet connection.
7. Check `git status` and inspect the changes. Do not stage `.env`, uploaded media or `node_modules`.
8. Run the build and local tests before committing:

```powershell
cd server
npm run dev

# In another terminal
cd client
npm run build

# In another terminal
cd admin
npm run build
```

9. When everything works locally:

```powershell
cd C:\path\to\Imboni-News
git status
git add server client admin docs README.md .gitignore
git commit -m "Repair Imboni News project and secure CMS workflows"
git push origin main
```

If your branch is not named `main`, use your actual branch name. Review the staged file list before committing.

## Important

- The ZIP has no real database credentials. Create/maintain `server/.env` locally.
- The seed script now requires `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `server/.env`.
- Back up MongoDB before running the updated application against your existing database. New indexes and request workflow fields are introduced.
- Do not deploy this package publicly until the remaining items in `PROJECT_AUDIT_AND_REPAIR_REPORT.md` have been completed and tested.
