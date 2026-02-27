import type { ISubmissionRepository } from "../../domain/interfaces/ISubmissionRepository";
import type { Submission } from "../../domain/entities/submission.entity";

export class GetSubmissionsByTaskUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  async execute(taskId: number): Promise<Submission[]> {
    return this.submissionRepository.findByTask(taskId);
  }
}