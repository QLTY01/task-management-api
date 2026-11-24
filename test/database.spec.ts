import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseOptions } from '../src/database/database.options';
import { Task, TaskStatus } from '../src/tasks/task.entity';

describe('SQLite persistence', () => {
  it('migrates a fresh database and keeps rows after reopening', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'task-api-'));
    const path = join(dir, 'nested', 'tasks.sqlite');
    let db: DataSource | undefined;
    try {
      const options = databaseOptions(path) as DataSourceOptions;
      db = await new DataSource(options).initialize();
      const id = randomUUID();
      await db.getRepository(Task).save({ id, title: 'Persist me', status: TaskStatus.OPEN });
      await db.destroy();
      db = await new DataSource(options).initialize();
      expect((await db.getRepository(Task).findOneByOrFail({ id })).title).toBe('Persist me');
      expect(await db.query('SELECT name FROM migrations')).toHaveLength(1);
    } finally {
      if (db?.isInitialized) await db.destroy();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
