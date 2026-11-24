import { INestApplication, ValidationPipe } from '@nestjs/common';

// Shared by the real server and HTTP tests so validation behaves identically.
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
}
