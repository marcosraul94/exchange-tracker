import * as fs from "fs";
import * as path from "path";
import { MigrationRepository } from "../repositories/migration";
import { DynamoClient } from "../client";
import { Table } from "../enums";

interface MigrationModule {
  up: (client: DynamoClient) => Promise<void>;
  down: (client: DynamoClient) => Promise<void>;
}

export class MigrationManager {
  private readonly migrationsFolderPath: string;
  private readonly migrationRepo: MigrationRepository;
  private readonly isMigrationsFolderCreated: boolean;
  private readonly dynamoClient: DynamoClient;

  constructor() {
    this.migrationsFolderPath = path.resolve(__dirname, "../migrations");
    this.migrationRepo = new MigrationRepository();
    this.isMigrationsFolderCreated = fs.existsSync(this.migrationsFolderPath);
    this.dynamoClient = new DynamoClient(Table.MIGRATIONS);
  }

  private extractIdFromPath(path: string): number {
    const fileName = path.split("/").pop() || "";

    return parseInt(fileName.trim().split("-")[0]);
  }

  private async getFileMigrationPaths(): Promise<string[]> {
    if (!this.isMigrationsFolderCreated) return [];

    return fs
      .readdirSync(this.migrationsFolderPath)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"))
      .map((f) => path.join(this.migrationsFolderPath, f));
  }

  private async getNewMigrationId(): Promise<number> {
    const dbMigrations = await this.migrationRepo.getAll();
    const dbMigrationIds = dbMigrations.map((m) => m.id);
    const lastDbId =
      dbMigrationIds.length > 0 ? Math.max(...dbMigrationIds) : 0;

    const migrationPaths = await this.getFileMigrationPaths();
    const migrationPathIds = migrationPaths.map((p) =>
      this.extractIdFromPath(p),
    );
    const lastMigrationPathId =
      migrationPathIds.length > 0 ? Math.max(...migrationPathIds) : 0;

    return Math.max(lastDbId, lastMigrationPathId) + 1;
  }

  private generateTemplate(): string {
    return [
      'import { DynamoClient } from "../client";',
      "",
      "export async function up(client: DynamoClient): Promise<void> {",
      "",
      "}",
      "",
      "export async function down(client: DynamoClient): Promise<void> {",
      "",
      "}",
      "",
    ].join("\n");
  }

  private async getMigrationPathsToApply(): Promise<string[]> {
    const dbMigrations = await this.migrationRepo.getAll();
    const dbMigrationIds = dbMigrations.map((m) => String(m.id));
    const migrationPaths = await this.getFileMigrationPaths();

    return migrationPaths.filter(
      (p) => !dbMigrationIds.includes(p.split("-")[0]),
    );
  }

  private async applyMigration(path: string) {
    const module: MigrationModule = require(path);

    console.log(`Applying migration ${this.extractIdFromPath(path)}`);
    await module.up(this.dynamoClient);
    await this.migrationRepo.save({
      id: this.extractIdFromPath(path),
      path,
      createdAt: new Date(),
    });
    console.log(`Applied migration ${this.extractIdFromPath(path)}`);
  }

  private async revertMigration(path: string) {
    const module: MigrationModule = require(path);

    console.log(`Reverting migration ${this.extractIdFromPath(path)}`);
    await module.down(this.dynamoClient);
    await this.migrationRepo.delete({ id: this.extractIdFromPath(path) });
    console.log(`Reverted migration ${this.extractIdFromPath(path)}`);
  }

  private async getLatestAppliedMigrationPath(): Promise<string | undefined> {
    const allMigrations = await this.migrationRepo.getAll();
    if (allMigrations.length === 0) return undefined;

    const orderedMigrations = allMigrations.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const latestAppliedMigration =
      orderedMigrations[orderedMigrations.length - 1];

    return latestAppliedMigration.path;
  }

  private async getPendingMigrationPaths(): Promise<string[]> {
    const allMigrationPaths = await this.getFileMigrationPaths();
    const latestAppliedMigrationPath =
      await this.getLatestAppliedMigrationPath();
    if (!latestAppliedMigrationPath) return allMigrationPaths;

    return allMigrationPaths.filter((p) => p !== latestAppliedMigrationPath);
  }

  async create(name: string) {
    const newMigrationId = await this.getNewMigrationId();
    const paddedId = newMigrationId.toString().padStart(4, "0");
    const filename = `${paddedId}-${name}.ts`;
    const filepath = path.join(this.migrationsFolderPath, filename);

    if (!fs.existsSync(this.migrationsFolderPath)) {
      fs.mkdirSync(this.migrationsFolderPath, { recursive: true });
    }

    fs.writeFileSync(filepath, this.generateTemplate());
    console.log(`Created migration: ${this.extractIdFromPath(filepath)}`);
  }

  async migrateAll() {
    const pendingMigrationPaths = await this.getPendingMigrationPaths();
    for (const path of pendingMigrationPaths) {
      await this.applyMigration(path);
    }
  }

  async revertLast() {
    const appliedMigrations = await this.migrationRepo.getAll();
    console.log(`Applied migrations: ${appliedMigrations.length}`);
    const latestAppliedMigration =
      appliedMigrations[appliedMigrations.length - 1];
    if (!latestAppliedMigration) {
      console.log("Nothing to roll back.");
      return;
    }

    await this.revertMigration(latestAppliedMigration.path);
  }
}
