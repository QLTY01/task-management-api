# Task Management API

A small NestJS + TypeScript API for learning HTTP routing, validation, services, SQL persistence, and tests by reviewing each change. It uses TypeORM with a SQLite database through `sql.js`; no separate database server is needed.

## Get started (Windows / VS Code)

Prerequisites: Node.js 20 or newer, npm, and the VS Code **REST Client** extension (publisher: Huachao Mao).

In a PowerShell terminal opened in this repository:

```powershell
npm ci
npm run start:dev
```

The API listens on `http://localhost:3000`. Open a file in `http/` and click **Send Request** above a request. Files 04–06 first create a task: send that first request, then send the later requests in that same file; REST Client uses the stored response ID. Sending the delete request permanently removes that example task.

Other commands:

```powershell
npm run build       # compile production JavaScript to dist/
npm start           # run the previously built application
npm run typecheck   # check source and test TypeScript
npm test            # unit, HTTP and database tests
npm run test:cov    # coverage report in coverage/
```

By default, data is saved in `data/tasks.sqlite`, created on startup. Migrations run automatically; TypeORM schema synchronization is deliberately disabled. Restart the server and list tasks to see persistence. The file and `node_modules` are ignored by Git. Tests use isolated in-memory or temporary databases and do not touch your data.

To use another path or port in PowerShell before starting the server:

```powershell
$env:DB_PATH = 'data/other-tasks.sqlite'
$env:PORT = '3001'
npm run start:dev
```

`DB_PATH=:memory:` selects a non-persistent database. Environment variables remain in that terminal until changed or removed with `Remove-Item Env:DB_PATH` or `Remove-Item Env:PORT`. Update `@baseUrl` in the HTTP files if you change the port. If the port is in use, choose another one; if dependencies fail to install, check your Node version and rerun `npm ci`.

## API contract

| Method | Route | Success | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | 200 | Server alive |
| POST | `/tasks` | 201 | Create a task |
| GET | `/tasks` | 200 | List tasks |
| GET | `/tasks/:id` | 200 | Read one task |
| PATCH | `/tasks/:id` | 200 | Update supplied fields |
| DELETE | `/tasks/:id` | 204 | Delete, no body |

Create accepts `title` (required string, trimmed, 1–120 characters) and `description` (optional string, up to 2,000 characters). Tasks start with status `OPEN`; PATCH accepts either field and/or `status` (`OPEN`, `IN_PROGRESS`, `DONE`). Omitted fields are unchanged. Explicit `null`, empty updates, unknown fields, malformed UUIDs, and invalid values return 400. A valid UUID that does not exist returns 404. All IDs are generated UUID v4 strings. Responses include `id`, `title`, `description`, `status`, `createdAt`, and `updatedAt`; SQLite timestamp precision is one second. Lists sort by creation time descending, then ID ascending for ties.

## Review in order

Open the **Files changed** tab in each pull request and send the corresponding HTTP requests from the latest `main`. Each branch remains available on GitHub.

| Order | Pull request / retained branch | Start reading | REST Client |
| --- | --- | --- | --- |
| 1 | [Bootstrap #1](https://github.com/QLTY01/task-management-api/pull/1) `feature/bootstrap` | `src/main.ts`, `src/app.module.ts` | `http/01-health.http` |
| 2 | [Persistence #2](https://github.com/QLTY01/task-management-api/pull/2) `feature/sqlite-persistence` | `src/database/`, `src/tasks/task.entity.ts` | `http/02-persistence.http` |
| 3 | [Create and list #3](https://github.com/QLTY01/task-management-api/pull/3) `feature/create-list-tasks` | DTO, controller, service | `http/03-create-list.http` |
| 4 | [Read one #4](https://github.com/QLTY01/task-management-api/pull/4) `feature/get-task` | `findOne` in controller and service | `http/04-get-task.http` |
| 5 | [Update #5](https://github.com/QLTY01/task-management-api/pull/5) `feature/update-task` | update DTO, controller, service | `http/05-update-task.http` |
| 6 | [Delete #6](https://github.com/QLTY01/task-management-api/pull/6) `feature/delete-task` | `remove` in controller and service | `http/06-delete-task.http` |
| 7 | [Service tests #7](https://github.com/QLTY01/task-management-api/pull/7) `test/task-service-unit-tests` | `test/tasks.service.spec.ts` | Existing task HTTP files |

**History note:** The initial six feature commits were published directly to `main` before the separate-branch requirement was clarified. To preserve published history, PRs #1–#6 reconstruct those exact feature changes and merge them in order into `review/feature-history`, not `main`; that branch matched `main` at the end of the reconstruction. PR #7 and later updates target `main` normally. No published commits were rewritten.

## Design notes

- `main.ts` boots Nest; `configure-app.ts` applies the same strict validation pipe to production and HTTP tests. Controllers map HTTP requests; `TasksService` holds application logic; the TypeORM repository handles SQL.
- DTO decorators validate input at the boundary. A PATCH uses optional fields but rejects explicit null, so accidental nulls cannot silently overwrite data. The current API does not clear a description once set.
- The migration describes the table and a database-level status check. On startup TypeORM applies pending migrations once; changing an entity alone does not update the schema. Add a new migration for future schema changes.
- HTTP tests use Supertest against a Nest app; `database.spec.ts` creates, closes, and reopens a temporary SQLite file; service unit tests replace the repository with a mock. The REST Client files let you repeat the behavior manually.
- This is a learning project, not a hardened multi-user service: it has no authentication, authorization, pagination, rate limiting, or concurrency strategy. `sql.js` loads the database in memory and writes the file on changes; use only one application process against a file. For production or multiple processes, use a server database such as PostgreSQL, a real migration workflow, backups, monitoring, and security controls.
