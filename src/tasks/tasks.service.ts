import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
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

  async findOne(id: string): Promise<Task> {
    const task = await this.tasks.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    if (!Object.values(dto).some((value) => value !== undefined)) {
      throw new BadRequestException('Provide at least one field to update');
    }
    const result = await this.tasks.update(id, dto);
    if (!result.affected) throw new NotFoundException(`Task ${id} not found`);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tasks.delete(id);
    if (!result.affected) throw new NotFoundException(`Task ${id} not found`);
  }
}
