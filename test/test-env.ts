// Each test application uses its own in-memory database, never the developer's file.
process.env.DB_PATH = ':memory:';
