import { MigrationManager } from "../tools/migration-manager";

async function main() {
  const migration = new MigrationManager();
  await migration.revertLast();
}

main().catch((err) => {
  console.error("Failed to run all migrations:", err);
  process.exit(1);
});
