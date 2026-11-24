import { Controller, Get, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptions } from './database/database.options';
import { TasksModule } from './tasks/tasks.module';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: () => databaseOptions() }), TasksModule],
  controllers: [HealthController],
})
export class AppModule {}
