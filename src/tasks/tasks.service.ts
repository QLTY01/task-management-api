import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task, TaskStatus } from './task.entity';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly tasks: Repository<Task>) {}

  create(dto: CreateTaskDto): Promise<Task> {
    const task = this.tasks.create({
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? null,
      status: TaskStatus.OPEN,
    });
    return this.tasks.save(task);
  }

  findAll(): Promise<Task[]> {
    return this.tasks.find({ order: { createdAt: 'DESC', id: 'ASC' } });
  }
}
