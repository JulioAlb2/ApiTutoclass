import type { Request, Response, NextFunction } from "express";
import type { TokenService } from "../services/TokenService";
import { logger } from "../../../shared/logger";

export function authMiddleware(tokenService: TokenService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      logger.warn(`Auth sin token: ${req.method} ${req.originalUrl}`);
      res.status(401).json({ error: "Token no proporcionado" });
      return;
    }

    try {
      req.user = tokenService.verifyToken(token);
      next();
    } catch (error) {
      logger.warn(`Auth token inválido: ${req.method} ${req.originalUrl} — ${(error as Error).message}`);
      res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }
    if (!roles.includes(req.user.rol)) {
      logger.warn(`Acceso denegado: usuario ${req.user.id} (${req.user.rol}) intentó ${req.method} ${req.originalUrl} — requiere [${roles.join(", ")}]`);
      res.status(403).json({ error: "Sin permiso para esta acción" });
      return;
    }
    next();
  };
}
