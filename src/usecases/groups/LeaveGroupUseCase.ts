import type { IGroupRepository } from "../../domain/interfaces/IGroupRepository";

export class LeaveGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(groupId: number, studentId: number): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Grupo no encontrado");
    }

    const enrolled = await this.groupRepository.isStudentEnrolled(
      groupId,
      studentId
    );
    if (!enrolled) {
      throw new Error("No estás inscrito en este grupo");
    }

    await this.groupRepository.removeStudent(groupId, studentId);
  }
}
