import type { IGroupRepository } from "../../domain/interfaces/IGroupRepository";

export class DeleteGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(groupId: number): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Grupo no encontrado");
    }

    const deleted = await this.groupRepository.delete(groupId);
    if (!deleted) {
      throw new Error("Error al eliminar el grupo");
    }
  }
}
