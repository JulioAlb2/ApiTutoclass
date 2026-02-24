import type { IMessageRepository } from "../../domain/interfaces/IMessageRepository";
import type { Message } from "../../domain/entities/menssaje.entity";

export class UpdateMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(messageId: number, text: string): Promise<Message> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new Error("Mensaje no encontrado");
    }

    const trimmed = text?.trim() ?? "";
    if (!trimmed) {
      throw new Error("El mensaje no puede estar vacío");
    }

    const updated = await this.messageRepository.update(messageId, trimmed);
    if (!updated) {
      throw new Error("Error al actualizar el mensaje");
    }
    return updated;
  }
}
