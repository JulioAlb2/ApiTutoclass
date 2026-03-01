import type { Request, Response, NextFunction } from "express";
import type { IGroupRepository } from "../../../domain/interfaces/IGroupRepository";
import { GroupStatus } from "../../../domain/enums/stateGroup.enum";
import type {
  CreateGroupUseCase,
  CreateGroupInput,
} from "../../../usecases/groups/CreateGroupUseCase";
import type { UpdateGroupUseCase } from "../../../usecases/groups/UpdateGroupUseCase";
import type { DeleteGroupUseCase } from "../../../usecases/groups/DeleteGroupUseCase";
import type { JoinGroupUseCase } from "../../../usecases/groups/JoinGroupUseCase";
import type { LeaveGroupUseCase } from "../../../usecases/groups/LeaveGroupUseCase";
import type { UpdateGroupInput } from "../../../usecases/groups/UpdateGroupUseCase";

export class GroupsController {
  constructor(
    private readonly groupRepository: IGroupRepository,
    private readonly createGroup: CreateGroupUseCase,
    private readonly updateGroup: UpdateGroupUseCase,
    private readonly deleteGroup: DeleteGroupUseCase,
    private readonly joinGroup: JoinGroupUseCase,
    private readonly leaveGroup: LeaveGroupUseCase
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
      const group = await this.groupRepository.findById(id);
      if (!group) {
        res.status(404).json({ error: "Grupo no encontrado" });
        return;
      }
      res.json(group);
    } catch (err) {
      next(err);
    }
  };

  getByTeacher = async (
    req: Request<{ teacherId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const teacherId = parseInt(req.params.teacherId, 10);
      if (Number.isNaN(teacherId)) {
        res.status(400).json({ error: "ID de profesor inválido" });
        return;
      }
      const groups = await this.groupRepository.findByTeacher(teacherId);
      res.json(groups);
    } catch (err) {
      next(err);
    }
  };

  getByStudent = async (
    req: Request<{ studentId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      if (Number.isNaN(studentId)) {
        res.status(400).json({ error: "ID de alumno inválido" });
        return;
      }
      const groups = await this.groupRepository.findByStudent(studentId);
      res.json(groups);
    } catch (err) {
      next(err);
    }
  };

  getActive = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groups = await this.groupRepository.findAllActive();
      res.json(groups);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<object, object, CreateGroupBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user!;
      const body = req.body;
      const date = body.date ? new Date(body.date) : new Date();
      const createInput: CreateGroupInput = {
        name: body.name,
        subject: body.subject,
        description: body.description ?? null,
        teacherId: user.id,
        teacherName: body.teacherName ?? user.email,
        date,
        accessCode: body.accessCode,
      };
      if (body.status === "finalizada") {
        createInput.status = GroupStatus.FINALIZADA;
      }
      const data = await this.createGroup.execute(createInput);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<{ id: string }, object, UpdateGroupBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const body = req.body;
      const input: UpdateGroupInput = {};
      if (body.name !== undefined) input.name = body.name;
      if (body.subject !== undefined) input.subject = body.subject;
      if (body.description !== undefined) input.description = body.description;
      if (body.date !== undefined) input.date = new Date(body.date);
      if (body.status !== undefined)
        input.status =
          body.status === "finalizada" ? GroupStatus.FINALIZADA : GroupStatus.ACTIVE;
      const data = await this.updateGroup.execute(id, input);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  remove = async (
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
      await this.deleteGroup.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  join = async (
    req: Request<object, object, { accessCode: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const studentId = req.user!.id;
      const { accessCode } = req.body;
      if (!accessCode?.trim()) {
        res.status(400).json({ error: "Código de acceso requerido" });
        return;
      }
      const data = await this.joinGroup.execute(studentId, accessCode.trim());
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  leave = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (Number.isNaN(groupId)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const studentId = req.user!.id;
      await this.leaveGroup.execute(groupId, studentId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  getStudents = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (Number.isNaN(groupId)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        res.status(404).json({ error: "Grupo no encontrado" });
        return;
      }
      const students = await this.groupRepository.getStudentsByGroup(groupId);
      res.json(students);
    } catch (err) {
      next(err);
    }
  };

  isEnrolled = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groupId = parseInt(req.params.id, 10);
      if (Number.isNaN(groupId)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const studentId = req.user!.id;
      const enrolled = await this.groupRepository.isStudentEnrolled(
        groupId,
        studentId
      );
      res.json({ enrolled });
    } catch (err) {
      next(err);
    }
  };
}

type CreateGroupBody = {
  name: string;
  subject: string;
  description?: string | null;
  teacherName?: string;
  date?: string;
  accessCode: string;
  status?: "activa" | "finalizada";
};

type UpdateGroupBody = {
  name?: string;
  subject?: string;
  description?: string | null;
  date?: string;
  status?: "activa" | "finalizada";
};
