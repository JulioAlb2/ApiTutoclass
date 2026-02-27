import type { Request, Response, NextFunction } from "express";
import multer, { type StorageEngine } from "multer";
import path from "path";
import type { ISubmissionRepository } from "../../../domain/interfaces/ISubmissionRepository";
import type { SubmitTaskUseCase } from "../../../usecases/submissions/SubmitTaskUseCase";
import type { GradeSubmissionUseCase } from "../../../usecases/submissions/GradeSubmissionUseCase";
import type { GetSubmissionsByTaskUseCase } from "../../../usecases/submissions/GetSubmissionsByTaskUseCase";
import type { GradeSubmissionInput } from "../../../usecases/submissions/GradeSubmissionUseCase";

const storage: StorageEngine = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, path.join(__dirname, '../../../../uploads')); // Adjust path
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export class SubmissionsController {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly submitTask: SubmitTaskUseCase,
    private readonly gradeSubmission: GradeSubmissionUseCase,
    private readonly getSubmissionsByTask: GetSubmissionsByTaskUseCase
  ) {}

  submit = [
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { taskId, studentId } = req.body;
        const fileReq = req as any;

        // basic validation
        if (!fileReq.file) {
          res.status(400).json({ error: "Archivo requerido" });
          return;
        }
        const taskIdNum = parseInt(taskId, 10);
        const studentIdNum = parseInt(studentId, 10);
        if (Number.isNaN(taskIdNum) || Number.isNaN(studentIdNum)) {
          res.status(400).json({ error: "ID de tarea o estudiante inválido" });
          return;
        }

        const submission = await this.submitTask.execute({
          taskId: taskIdNum,
          studentId: studentIdNum,
          fileName: fileReq.file.originalname,
          filePath: fileReq.file.path,
        });
        res.status(201).json(submission);
      } catch (err) {
        // log error for debugging (replace console.log with your logger if any)
        console.error("Error en SubmitController.submit:", err);
        next(err);
      }
    }
  ];

  getByTask = async (
    req: Request<{ taskId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      if (Number.isNaN(taskId)) {
        res.status(400).json({ error: "ID de tarea inválido" });
        return;
      }
      const submissions = await this.getSubmissionsByTask.execute(taskId);
      res.json(submissions);
    } catch (err) {
      next(err);
    }
  };

  grade = async (
    req: Request<{ id: string }, any, GradeSubmissionInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const updated = await this.gradeSubmission.execute(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };
}