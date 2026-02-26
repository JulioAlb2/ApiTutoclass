import type { Request, Response, NextFunction } from "express";
import type { ITaskRepository } from "../../../domain/interfaces/ITaskRepository";
import { TaskStatus } from "../../../domain/enums/task.enum";
import type {
  CreateTaskUseCase,
  CreateTaskInput,
} from "../../../usecases/tasks/CreateTaskUseCase";
import type { UpdateTaskUseCase } from "../../../usecases/tasks/UpdateTaskUseCase";
import type { DeleteTaskUseCase } from "../../../usecases/tasks/DeleteTaskUseCase";
import type { GetTasksByGroupUseCase } from "../../../usecases/tasks/GetTasksByGroupUseCase";
import type { UpdateTaskInput } from "../../../usecases/tasks/UpdateTaskUseCase";

export class TasksController {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly createTask: CreateTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
    private readonly getTasksByGroup: GetTasksByGroupUseCase
  ) {}

  getById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({ error: "Tarea no encontrada" });
        return;
      }
      res.json(task);
    } catch (err) {
      next(err);
    }
  };

  getByGroup = async (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groupId = parseInt(req.params.groupId, 10);
      if (Number.isNaN(groupId)) {
        res.status(400).json({ error: "ID de grupo inválido" });
        return;
      }
      const tasks = await this.getTasksByGroup.execute(groupId);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<{}, {}, CreateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const task = await this.createTask.execute(req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<{ id: string }, {}, UpdateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const task = await this.updateTask.execute(id, req.body);
      res.json(task);
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      await this.deleteTask.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}