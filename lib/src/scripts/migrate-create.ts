import { MigrationManager } from "../tools/migration-manager";

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: npm run migrate:create -- <name>");
    process.exit(1);
  }

  const migration = new MigrationManager();
  await migration.create(name);
}

main().catch((err) => {
  console.error("Failed to create migration:", err);
  process.exit(1);
});
