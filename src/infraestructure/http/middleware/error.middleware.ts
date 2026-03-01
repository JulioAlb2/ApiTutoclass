import type { Request, Response, NextFunction } from "express";
import { logger } from "../../../shared/logger";

const STATUS_MAP: Record<string, number> = {
  "Token no proporcionado": 401,
  "Token inv?lido o expirado": 401,
  "Token expirado": 401,
  "Token inv?lido": 401,
  "Sin permiso para esta acci?n": 403,
  "No autenticado": 403,
  "Grupo no encontrado": 404,
  "Mensaje no encontrado": 404,
  "Usuario no encontrado": 404,
  "El email ya est? registrado": 400,
  "Credenciales inv?lidas": 400,
  "C?digo de acceso inv?lido": 400,
  "El grupo no est? activo": 400,
  "Ya est?s inscrito en este grupo": 400,
  "No est?s inscrito en este grupo": 400,
  "El c?digo de acceso ya est? en uso": 400,
  "El mensaje no puede estar vac?o": 400,
};

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = STATUS_MAP[err.message] ?? 500;

  if (status === 500) {
    logger.error(`${req.method} ${req.originalUrl} ? 500`, err);
    res.status(500).json({ error: "Error interno del servidor" });
    return;
  }

  logger.warn(`${req.method} ${req.originalUrl} ? ${status}: ${err.message}`);
  res.status(status).json({ error: err.message });
}
