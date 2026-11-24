import { Controller, Get, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptions } from './database/database.options';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: () => databaseOptions() })],
  controllers: [HealthController],
})
export class AppModule {}
