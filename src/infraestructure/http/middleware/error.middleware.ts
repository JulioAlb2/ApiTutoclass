import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err.message;

  if (
    message === "Token no proporcionado" ||
    message === "Token inválido o expirado" ||
    message === "Token expirado" ||
    message === "Token inválido"
  ) {
    res.status(401).json({ error: message });
    return;
  }
  if (message === "Sin permiso para esta acción" || message === "No autenticado") {
    res.status(403).json({ error: message });
    return;
  }
  if (
    message === "Grupo no encontrado" ||
    message === "Mensaje no encontrado" ||
    message === "Usuario no encontrado"
  ) {
    res.status(404).json({ error: message });
    return;
  }
  if (
    message === "El email ya está registrado" ||
    message === "Credenciales inválidas" ||
    message === "Código de acceso inválido" ||
    message === "El grupo no está activo" ||
    message === "Ya estás inscrito en este grupo" ||
    message === "No estás inscrito en este grupo" ||
    message === "El código de acceso ya está en uso" ||
    message === "El mensaje no puede estar vacío"
  ) {
    res.status(400).json({ error: message });
    return;
  }
  
  console.error("[ERROR HANDLER] Error desconocido:", err.message);
  console.error("[ERROR HANDLER] Stack:", err.stack);
  console.error("[500]", err);
  res.status(500).json({ error: "Error interno del servidor" });
}
