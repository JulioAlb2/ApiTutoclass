export interface ISubmission {
  id: number;
  taskId: number;
  studentId: number;
  fileName: string;
  filePath: string;
  submittedAt: Date;
  grade: number | undefined;
  feedback: string | undefined;
}

export class Submission implements ISubmission {
  constructor(
    public readonly id: number,
    public readonly taskId: number,
    public readonly studentId: number,
    public fileName: string,
    public filePath: string,
    public readonly submittedAt: Date,
    public grade: number | undefined,
    public feedback: string | undefined
  ) {}
}