import { TaskStatus } from "../enums/task.enum";

export interface ITask {
  id: number;
  title: string;
  description: string;
  groupId: number;
  assignedBy: number; // userId of the teacher
  dueDate: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Task implements ITask {
  constructor(
    public readonly id: number,
    public title: string,
    public description: string,
    public readonly groupId: number,
    public readonly assignedBy: number,
    public dueDate: Date,
    public status: TaskStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}