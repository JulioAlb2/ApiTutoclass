import type { ISubmissionRepository } from "../../domain/interfaces/ISubmissionRepository";
import type { Submission } from "../../domain/entities/submission.entity";

export interface GradeSubmissionInput {
  grade?: number;
  feedback?: string;
}

export class GradeSubmissionUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  async execute(submissionId: number, input: GradeSubmissionInput): Promise<Submission> {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error("Entrega no encontrada");
    }

    const updated = await this.submissionRepository.update(submissionId, input);
    if (!updated) {
      throw new Error("Error al calificar la entrega");
    }
    return updated;
  }
}