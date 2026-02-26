import { Submission } from "../entities/submission.entity";

export interface ISubmissionRepository {
  findById(id: number): Promise<Submission | null>;
  findByTask(taskId: number): Promise<Submission[]>;
  findByStudent(studentId: number): Promise<Submission[]>;

  create(submission: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission>;
  update(id: number, data: Partial<Submission>): Promise<Submission | null>;
  delete(id: number): Promise<boolean>;
}