# Prisma Workflow Guide

Project: AmeyaSuite Backend (NestJS + Prisma + PostgreSQL)

This guide explains WHEN and WHAT commands to run for common Prisma + database tasks in this project. It reflects the current setup where individual model files live under `prisma/models/**` and are merged into `prisma/schema.prisma` using `models-manager.js`.

---
## 1. Golden Rules
1. Only `prisma/schema.prisma` is used by Prisma CLI. The files in `prisma/models/**` do NOTHING until you run the model generator:  
   `node prisma/models-manager.js generate`
2. After any model change: regenerate schema -> validate -> generate client -> apply to DB.
3. Pick ONE sync strategy per environment:
   - Development (with history): `prisma migrate dev`
   - Development quick prototype (no history): `prisma db push`
   - Production: build migrations locally, then deploy with `prisma migrate deploy`
4. Never commit an empty `schema.prisma` (or migrations will stop).
5. Changes to existing tables with data must go through a migration (avoid `db push` for those).

---
## 2. Typical Change Flow (Add / Modify a Model)
```
# 1. Edit or add a file in prisma/models/... e.g. prisma/models/core/Permission.prisma
# 2. Rebuild schema.prisma from modular files
node prisma/models-manager.js generate

# 3. (Optional) Format & validate schema
npx prisma format
npx prisma validate

# 4a. Create a new migration (preferred once DB has data)
npx prisma migrate dev --name add-permissions

# 4b. OR just push (only if early dev / disposable DB)
npx prisma db push

# 5. Regenerate client (migrate & db push already do this automatically, but safe to repeat)
npx prisma generate

# 6. (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

---
## 3. First-Time Setup (Empty Database)
```
node prisma/models-manager.js generate
npx prisma migrate dev --name init
```
This creates the migrations folder and tables.

If you intentionally want no migration history early on, you can use:
```
node prisma/models-manager.js generate
npx prisma db push
```
Later, switch to migrations before sharing with others.

---
## 4. Existing Database (Adopt / Baseline)
If tables ALREADY exist (e.g. imported from another system):
```
# Pull actual structure into schema.prisma
npx prisma db pull
# (Optional) Split schema back into modular files manually if needed
npx prisma generate
```
Then start adding changes via `migrate dev` going forward.

---
## 5. Command Cheat Sheet
| Task | Command |
|------|---------|
| Generate schema from modular model files | `node prisma/models-manager.js generate` |
| Validate schema syntax | `npx prisma validate` |
| Format schema file | `npx prisma format` |
| Create & apply migration (dev) | `npx prisma migrate dev --name <name>` |
| Apply pending migrations (prod/CI) | `npx prisma migrate deploy` |
| Push schema directly (no migrations) | `npx prisma db push` |
| Introspect existing DB | `npx prisma db pull` |
| Reset dev DB (DROPS DATA) | `npx prisma migrate reset` |
| Regenerate Prisma Client | `npx prisma generate` |
| Inspect/manage data GUI | `npx prisma studio` |
| Seed (current simplified seed) | `npm run prisma:seed` |

---
## 6. When to Use Which
| Situation | Use |
|-----------|-----|
| Add new model or field (dev) | `migrate dev` |
| Early throwaway prototype | `db push` |
| Rename / drop column with existing prod data | Manual adjust migration SQL (after `migrate dev`) |
| Align schema to legacy DB | `db pull` then refactor |
| Deploy to production | Commit migrations, run `migrate deploy` |
| Just changed modular files | `node prisma/models-manager.js generate` then normal flow |

---
## 7. Field Rename / Destructive Changes
Prisma treats a rename as drop + add by default (data loss risk). To preserve data:
1. Run `npx prisma migrate dev --create-only --name rename-user-field`
2. Edit the generated SQL manually to use `ALTER TABLE RENAME COLUMN`.
3. Run `npx prisma migrate dev` again (without `--create-only`) to apply.

---
## 8. Handling Empty schema.prisma
If `schema.prisma` is empty:
- Migrations won’t create tables.
- Prisma Client will not have delegates (e.g. `prisma.user`).
Fix: regenerate: `node prisma/models-manager.js generate`.

---
## 9. Seeds
Current seed script assumes minimal models. If you reintroduce complex models, update `prisma/seed.ts` accordingly. Run:
```
npm run prisma:seed
```
This uses the same `DATABASE_URL`.

---
## 10. Environment Variables
`.env` must include:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
```
(Optional) SSL or pooling options can be appended (e.g. `&pgbouncer=true`).

---
## 11. Production Deployment Outline
1. Commit schema + migrations.
2. In CI/CD: `npx prisma migrate deploy`.
3. Start application (Prisma Client already generated during build or generate again).
4. (Optional) Run seed only if idempotent.

---
## 12. Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Already in sync` but no tables | Empty schema or migrations applied to different DB | Regenerate schema / verify `DATABASE_URL` |
| `prisma.user is undefined` | Schema missing model at generate time | Ensure model exists then `npx prisma generate` |
| Migration conflicts | Edited old migration | Create new migration; don’t rewrite applied ones |
| Slow startup | Excessive query logging | Adjust `log` option in PrismaService |
| TypeError on relation field | Mismatch between schema + existing DB | Run `db pull` or fix migration chain |

---
## 13. Recommended Daily Flow
```
# Edit or add model file(s)
node prisma/models-manager.js generate
npx prisma migrate dev --name <change>
# or npx prisma db push (early phase only)
npx prisma generate
npm run dev
```

---
## 14. Switching Away From Modular Files
If you decide to keep everything only in `schema.prisma`:
1. Copy merged contents you want to keep.
2. Delete/ignore `prisma/models` and the manager script.
3. Remove related NPM scripts.
4. Continue using standard Prisma flow.

---
## 15. Quick Sanity Test Script
```
node prisma/models-manager.js generate
npx prisma validate
npx prisma migrate dev --name sanity-test
npx prisma studio
```
Confirm tables appear; rollback by `npx prisma migrate reset` (drops data).

---
Need additions or custom examples? Edit this file anytime.
