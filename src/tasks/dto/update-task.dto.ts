import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, ValidateIf } from 'class-validator';
import { TaskStatus } from '../task.entity';
import { CreateTaskDto } from './create-task.dto';

// Omitted fields are allowed; explicit null remains invalid.
export class UpdateTaskDto extends PartialType(CreateTaskDto, { skipNullProperties: false }) {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
