import { Task } from "../entities/task.entity";

export interface ITaskRepository {
  findById(id: number): Promise<Task | null>;
  findByGroup(groupId: number): Promise<Task[]>;
  findByAssignedBy(assignedBy: number): Promise<Task[]>;

  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: number, data: Partial<Task>): Promise<Task | null>;
  delete(id: number): Promise<boolean>;
}