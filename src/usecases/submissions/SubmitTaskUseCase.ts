import type { ISubmissionRepository } from "../../domain/interfaces/ISubmissionRepository";
import type { Submission } from "../../domain/entities/submission.entity";

export interface SubmitTaskInput {
  taskId: number;
  studentId: number;
  fileName: string;
  filePath: string;
}

export class SubmitTaskUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  async execute(input: SubmitTaskInput): Promise<Submission> {
    // Check if already submitted? For simplicity, allow multiple or check.
    return this.submissionRepository.create({
      taskId: input.taskId,
      studentId: input.studentId,
      fileName: input.fileName,
      filePath: input.filePath,
      grade: undefined,
      feedback: undefined,
    });
  }
}