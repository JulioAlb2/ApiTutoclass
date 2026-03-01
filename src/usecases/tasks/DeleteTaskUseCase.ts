import type { ITaskRepository } from "../../domain/interfaces/ITaskRepository";

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(taskId: number): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Tarea no encontrada");
    }

    const deleted = await this.taskRepository.delete(taskId);
    if (!deleted) {
      throw new Error("Error al eliminar la tarea");
    }
  }
}