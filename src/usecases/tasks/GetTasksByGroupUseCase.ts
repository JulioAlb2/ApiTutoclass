import type { ITaskRepository } from "../../domain/interfaces/ITaskRepository";
import type { Task } from "../../domain/entities/task.entity";

export class GetTasksByGroupUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(groupId: number): Promise<Task[]> {
    return this.taskRepository.findByGroup(groupId);
  }
}