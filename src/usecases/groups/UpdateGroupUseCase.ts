import type { IGroupRepository } from "../../domain/interfaces/IGroupRepository";
import type { Group } from "../../domain/entities/group.entity";

export interface UpdateGroupInput {
  name?: string;
  subject?: string;
  description?: string | null;
  date?: Date;
  status?: Group["status"];
}

export class UpdateGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(groupId: number, input: UpdateGroupInput): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Grupo no encontrado");
    }

    const updated = await this.groupRepository.update(groupId, input);
    if (!updated) {
      throw new Error("Error al actualizar el grupo");
    }
    return updated;
  }
}
