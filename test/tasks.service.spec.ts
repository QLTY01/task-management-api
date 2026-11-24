import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../src/tasks/task.entity';
import { TasksService } from '../src/tasks/tasks.service';

describe('TasksService', () => {
  const repository = {
    create: jest.fn(), save: jest.fn(), find: jest.fn(), findOneBy: jest.fn(),
    update: jest.fn(), delete: jest.fn(),
  };
  let service: TasksService;
  const task = { id: 'some-id', title: 'A task', description: null, status: TaskStatus.OPEN } as Task;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new TasksService(repository as unknown as Repository<Task>);
  });

  it('creates a task with an ID and default status', async () => {
    repository.create.mockImplementation((value) => value);
    repository.save.mockImplementation(async (value) => value);
    const result = await service.create({ title: 'A task' });
    expect(result).toMatchObject({ title: 'A task', description: null, status: TaskStatus.OPEN });
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('lists tasks with deterministic ordering', async () => {
    repository.find.mockResolvedValue([task]);
    await expect(service.findAll()).resolves.toEqual([task]);
    expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC', id: 'ASC' } });
  });
  it('reports a missing task', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('updates supplied values and reloads the row', async () => {
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOneBy.mockResolvedValue({ ...task, status: TaskStatus.DONE });
    await expect(service.update(task.id, { status: TaskStatus.DONE })).resolves.toMatchObject({ status: TaskStatus.DONE });
    expect(repository.update).toHaveBeenCalledWith(task.id, { status: TaskStatus.DONE });
  });
  it('rejects an empty update without touching the database', async () => {
    await expect(service.update(task.id, {})).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });
  it('reports missing rows on update and delete', async () => {
    repository.update.mockResolvedValue({ affected: 0 });
    repository.delete.mockResolvedValue({ affected: 0 });
    await expect(service.update('missing', { title: 'new' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('deletes an existing task', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });
    await expect(service.remove(task.id)).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(task.id);
  });
});
