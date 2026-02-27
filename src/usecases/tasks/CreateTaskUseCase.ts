import type { ITaskRepository } from "../../domain/interfaces/ITaskRepository";
import type { Task } from "../../domain/entities/task.entity";
import { TaskStatus } from "../../domain/enums/task.enum";

export interface CreateTaskInput {
  title: string;
  description: string;
  groupId: number;
  assignedBy: number;
  dueDate: Date;
  status?: TaskStatus;
}

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    return this.taskRepository.create({
      title: input.title,
      description: input.description,
      groupId: input.groupId,
      assignedBy: input.assignedBy,
      dueDate: input.dueDate,
      status: input.status ?? TaskStatus.PENDING,
    });
  }
}