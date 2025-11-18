#!/usr/bin/env bash
# Simple helper script to migrate data from a SQLite database to MySQL/MariaDB
# WARNING: This script is a convenience helper. Always backup your DBs first.
# Usage: SQLITE_FILE=./dev.db MYSQL_HOST=127.0.0.1 MYSQL_DB=lumidb MYSQL_USER=lumiuser MYSQL_PASSWORD=yourpw ./prisma/migrate_sqlite_to_mysql.sh
set -euo pipefail

if [ -z "${SQLITE_FILE:-}" ]; then
  echo "Missing SQLITE_FILE env (e.g. SQLITE_FILE=./dev.db)"
  exit 1
fi
if [ -z "${MYSQL_DB:-}" ]; then
  echo "Missing MYSQL_DB env"
  exit 1
fi

SQLITE_FILE=${SQLITE_FILE}
MYSQL_HOST=${MYSQL_HOST:-127.0.0.1}
MYSQL_USER=${MYSQL_USER:-root}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-}
MYSQL_DB=${MYSQL_DB}

# 1. Ensure target schema exists (use Prisma DB push to create schema)
echo "Make sure you've already run: npx prisma db push --schema=prisma/schema.mysql.prisma"

# 2. Get table list from sqlite
TABLES=$(sqlite3 "$SQLITE_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")

echo "Found tables:"
for t in $TABLES; do echo " - $t"; done

# 3. Import each table CSV into MySQL
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

for table in $TABLES; do
  echo "Exporting $table"
  sqlite3 -header -csv "$SQLITE_FILE" "SELECT * FROM \"$table\";" > "$TMPDIR/$table.csv"
  echo "Importing $table into MySQL ($MYSQL_DB)"

  # Disable foreign key checks to avoid order issues
  mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE \`$table\`;" || true
  # Use LOAD DATA LOCAL INFILE
  mysql --local-infile=1 -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" -e "LOAD DATA LOCAL INFILE '$TMPDIR/$table.csv' INTO TABLE \`$table\` FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"
  mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" -e "SET FOREIGN_KEY_CHECKS=1;"
done

echo "Migration attempt complete — verify the data, indexes and types.
Be aware of: datetime formats, booleans (use 0/1), json strings.
If you have complex types (relations or JSON) test and adjust schema types.
"
