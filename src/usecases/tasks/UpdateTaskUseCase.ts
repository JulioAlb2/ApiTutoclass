import type { ITaskRepository } from "../../domain/interfaces/ITaskRepository";
import type { Task } from "../../domain/entities/task.entity";
import { TaskStatus } from "../../domain/enums/task.enum";

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
}

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(taskId: number, input: UpdateTaskInput): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Tarea no encontrada");
    }

    const updated = await this.taskRepository.update(taskId, input);
    if (!updated) {
      throw new Error("Error al actualizar la tarea");
    }
    return updated;
  }
}