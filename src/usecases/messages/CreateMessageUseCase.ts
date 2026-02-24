import type { IMessageRepository } from "../../domain/interfaces/IMessageRepository";
import type { Message } from "../../domain/entities/menssaje.entity";
import { MessageType } from "../../domain/enums/messages.enum";

export interface CreateMessageInput {
  groupId: number;
  userId: number;
  userName: string;
  userRole: string;
  text: string;
  type?: MessageType;
}

export class CreateMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(input: CreateMessageInput): Promise<Message> {
    const text = input.text?.trim() ?? "";
    if (!text) {
      throw new Error("El mensaje no puede estar vacío");
    }

    return this.messageRepository.create({
      groupId: input.groupId,
      userId: input.userId,
      userName: input.userName,
      userRole: input.userRole,
      text,
      type: input.type ?? MessageType.TEXTO,
    });
  }
}
