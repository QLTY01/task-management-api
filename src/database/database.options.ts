import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from '../tasks/task.entity';
import { CreateTasksTable1700000000000 } from './migrations/1700000000000-create-tasks-table';

export function databaseOptions(path = process.env.DB_PATH ?? 'data/tasks.sqlite'): TypeOrmModuleOptions {
  const inMemory = path === ':memory:';
  const location = inMemory ? undefined : resolve(path);
  if (location) mkdirSync(dirname(location), { recursive: true });
  return {
    type: 'sqljs',
    ...(location ? { location, autoSave: true } : { autoSave: false }),
    entities: [Task],
    migrations: [CreateTasksTable1700000000000],
    migrationsRun: true,
    synchronize: false,
  };
}
