import type { Request, Response, NextFunction } from "express";
import type { IMessageRepository } from "../../../domain/interfaces/IMessageRepository";
import type { CreateMessageUseCase } from "../../../usecases/messages/CreateMessageUseCase";
import type { UpdateMessageUseCase } from "../../../usecases/messages/UpdateMessageUseCase";
import type { DeleteMessageUseCase } from "../../../usecases/messages/DeleteMessageUseCase";
import { MessageType } from "../../../domain/enums/messages.enum";

export class MessagesController {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly createMessage: CreateMessageUseCase,
    private readonly updateMessage: UpdateMessageUseCase,
    private readonly deleteMessage: DeleteMessageUseCase
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
      const message = await this.messageRepository.findById(id);
      if (!message) {
        res.status(404).json({ error: "Mensaje no encontrado" });
        return;
      }
      res.json(message);
    } catch (err) {
      next(err);
    }
  };

  getByGroup = async (
    req: Request<{ groupId: string }, object, object, { limit?: string; from?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groupId = parseInt(req.params.groupId, 10);
      if (Number.isNaN(groupId)) {
        res.status(400).json({ error: "ID de grupo inválido" });
        return;
      }
      const limit = req.query.limit != null ? parseInt(req.query.limit, 10) : undefined;
      const from = req.query.from != null ? new Date(req.query.from) : undefined;
      const messages = await this.messageRepository.findByGroup(
        groupId,
        limit && !Number.isNaN(limit) ? limit : undefined,
        from
      );
      res.json(messages);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<object, object, CreateMessageBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user!;
      const body = req.body;
      const data = await this.createMessage.execute({
        groupId: body.groupId,
        userId: user.id,
        userName: body.userName ?? user.email,
        userRole: user.rol,
        text: body.text,
        type: body.type === "sistema" ? MessageType.SISTEMA : MessageType.TEXTO,
      });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<{ id: string }, object, { text: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const { text } = req.body;
      const data = await this.updateMessage.execute(id, text);
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
      await this.deleteMessage.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

type CreateMessageBody = {
  groupId: number;
  userName?: string;
  text: string;
  type?: "texto" | "sistema";
};
