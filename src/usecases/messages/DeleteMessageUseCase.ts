import type { IMessageRepository } from "../../domain/interfaces/IMessageRepository";

export class DeleteMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(messageId: number): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new Error("Mensaje no encontrado");
    }

    const deleted = await this.messageRepository.delete(messageId);
    if (!deleted) {
      throw new Error("Error al eliminar el mensaje");
    }
  }
}
