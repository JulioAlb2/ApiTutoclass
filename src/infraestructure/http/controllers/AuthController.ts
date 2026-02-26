import type { Request, Response, NextFunction } from "express";
import type { RegisterAlumnoUseCase } from "../../../usecases/auth/RegisterAlumnoUseCase";
import type { RegisterMaestroUseCase } from "../../../usecases/auth/RegisterMaestroUseCase";
import type { LoginUseCase } from "../../../usecases/auth/LoginUseCase";
import type { GetProfileUseCase } from "../../../usecases/auth/GetProfileUseCase";
import type {
  RegisterAlumnoDTO,
  RegisterMaestroDTO,
  LoginDTO,
} from "../configure/auth.config";

export class AuthController {
  constructor(
    private readonly registerAlumno: RegisterAlumnoUseCase,
    private readonly registerMaestro: RegisterMaestroUseCase,
    private readonly login: LoginUseCase,
    private readonly getProfile: GetProfileUseCase
  ) {}

  registerAlumnoHandler = async (
    req: Request<object, object, RegisterAlumnoDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = { ...req.body, rol: "alumno" as const };
      const data = await this.registerAlumno.execute(body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  registerMaestroHandler = async (
    req: Request<object, object, RegisterMaestroDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = { ...req.body, rol: "maestro" as const };
      const data = await this.registerMaestro.execute(body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  loginHandler = async (
    req: Request<object, object, LoginDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.login.execute(req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getProfileHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data = await this.getProfile.execute(userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}
