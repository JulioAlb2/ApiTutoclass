import type { IGroupRepository } from "../../domain/interfaces/IGroupRepository";
import type { Group } from "../../domain/entities/group.entity";
import { GroupStatus } from "../../domain/enums/stateGroup.enum";

export class JoinGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(studentId: number, accessCode: string): Promise<Group> {
    const group = await this.groupRepository.findByCode(accessCode);
    if (!group) {
      throw new Error("Código de acceso inválido");
    }
    if (group.status !== GroupStatus.ACTIVE) {
      throw new Error("El grupo no está activo");
    }

    const enrolled = await this.groupRepository.isStudentEnrolled(
      group.id,
      studentId
    );
    if (enrolled) {
      throw new Error("Ya estás inscrito en este grupo");
    }

    await this.groupRepository.addStudent(group.id, studentId);
    return group;
  }
}
