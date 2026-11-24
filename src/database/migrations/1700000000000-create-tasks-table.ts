import { MigrationInterface, QueryRunner } from 'typeorm';

// Migrations make schema changes explicit and repeatable across restarts.
export class CreateTasksTable1700000000000 implements MigrationInterface {
  name = 'CreateTasksTable1700000000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "tasks" (
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar(120) NOT NULL,
      "description" text,
      "status" varchar NOT NULL DEFAULT 'OPEN',
      "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
      "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
      CONSTRAINT "CHK_task_status" CHECK ("status" IN ('OPEN', 'IN_PROGRESS', 'DONE'))
    )`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "tasks"');
  }
}
