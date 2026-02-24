import type { IGroupRepository } from "../../domain/interfaces/IGroupRepository";
import type { Group } from "../../domain/entities/group.entity";
import { GroupStatus } from "../../domain/enums/stateGroup.enum";

export interface CreateGroupInput {
  name: string;
  subject: string;
  description?: string | null;
  teacherId: number;
  teacherName: string;
  date: Date;
  accessCode: string;
  status?: GroupStatus;
}

export class CreateGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(input: CreateGroupInput): Promise<Group> {
    const existing = await this.groupRepository.findByCode(input.accessCode);
    if (existing) {
      throw new Error("El código de acceso ya está en uso");
    }

    return this.groupRepository.create({
      name: input.name,
      subject: input.subject,
      description: input.description ?? null,
      teacherId: input.teacherId,
      teacherName: input.teacherName,
      date: input.date,
      accessCode: input.accessCode,
      status: input.status ?? GroupStatus.ACTIVE,
    });
  }
}
