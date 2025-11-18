# Migrate to MySQL / MariaDB (Prisma)

This document explains how to switch Prisma datasource from SQLite to MySQL/MariaDB and gives options for migrating data.

## 1) Files to change

- `prisma/schema.prisma` — default (sqlite). To switch to MySQL change `provider = "mysql"` and set `url = env("DATABASE_URL")`.
- Or: use the included `prisma/schema.mysql.prisma` to keep a MySQL-specific schema.

## 2) What to set in `.env` (on VPS)

Set `DATABASE_URL` to point to your MySQL/MariaDB server (use IPv4 127.0.0.1 to avoid socket differences):
```bash
DATABASE_URL="mysql://lumiuser:YOUR_PASSWORD@127.0.0.1:3306/lumidb"
```

If you use schema mapping in the URL (not required for MySQL), you can omit the `?schema=` part.

## 3) Create DB & user on the server (MariaDB)

Login as root and run:

```bash
sudo mysql -u root -p
# then in mysql shell
CREATE DATABASE lumidb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lumiuser'@'127.0.0.1' IDENTIFIED BY 'YourStrongP@ss';
GRANT ALL PRIVILEGES ON lumidb.* TO 'lumiuser'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

> If you use DirectAdmin, you can also create DB and user from the admin UI and note the hostname (usually 127.0.0.1).

## 4) Generate Prisma Client and apply schema

Locally (VSCode), run:

```bash
# Use MySQL schema (if using the alternative schema file in repo)
npx prisma generate --schema=prisma/schema.mysql.prisma
npx prisma db push --schema=prisma/schema.mysql.prisma
```

If you prefer to modify `prisma/schema.prisma` directly, run without `--schema`.

## 5) Seed new database

If you have a seeding script (prisma/seed.ts), run it to create admin users and sample data:

```bash
# Ensure DATABASE_URL is set to your MySQL DB in the env where you run the command
npx prisma db seed --schema=prisma/schema.mysql.prisma
```

## 6) Migrate data **from** SQLite (optional)

Option A (recommended when you have a small dataset): Use the helper script to export CSVs from SQLite and import them into MySQL. This is fastest but needs manual validation.

```bash
SQLITE_FILE=./dev.db MYSQL_HOST=127.0.0.1 MYSQL_DB=lumidb MYSQL_USER=lumiuser MYSQL_PASSWORD=YourPW ./prisma/migrate_sqlite_to_mysql.sh
```

Caveats:
- This naively imports CSVs and may break on datatypes (e.g., datetime format differences), JSON fields, or relations. Validate tables and migrate carefully.
- This script requires `sqlite3` and `mysql` CLIs on the machine where you run it.

Option B (Prisma-based script): If you want a reliable, schema-aware migration, I can add a Node script that reads rows from sqlite (via `better-sqlite3` or `sqlite3`) and inserts them through Prisma into MySQL. This preserves relationships and converts types more safely. Ask me if you want me to include it.

## 7) Rebuild and restart the app (VPS)

On the VPS:

```bash
# Replace DATABASE_URL in .env with your MySQL URL
# Rebuild Prisma client and app
npx prisma generate --schema=prisma/schema.mysql.prisma
npm run prebuild
npm run build
# Restart pm2
pm2 restart lumi-billing
pm2 logs lumi-billing -f
```

## 8) Post-migration checks
- Check users; test login with seeded admin account.
- Verify invoices, services, and relations.
- Inspect `prisma/migrations` if you created migrations; ensure clean migration history.

## 9) Rollback plan
- Keep a backup of the original SQLite DB and a dump of the MySQL database before you do large-scale imports. If something is wrong, restore DBs and try again.

---

If you'd like a more automated Prisma-based migration script included in the repo (Node script that preserves relations), tell me and I'll scaffold it for you.