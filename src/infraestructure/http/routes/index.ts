import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import type { AuthController } from "../controllers/AuthController";
import type { GroupsController } from "../controllers/GroupsController";
import type { MessagesController } from "../controllers/MessagesController";
import type { TokenService } from "../services/TokenService";

export function createRoutes(
  tokenService: TokenService,
  authController: AuthController,
  groupsController: GroupsController,
  messagesController: MessagesController
): Router {
  const auth = authMiddleware(tokenService);
  const router = Router();

  // Auth (públicas)
  router.post("/auth/register/alumno", authController.registerAlumnoHandler);
  router.post("/auth/register/maestro", authController.registerMaestroHandler);
  router.post("/auth/login", authController.loginHandler);

  // Auth (protegida)
  router.get("/auth/profile", auth, authController.getProfileHandler);

  // Grupos (públicas)
  router.get("/groups", groupsController.getActive);
  router.get("/groups/teacher/:teacherId", groupsController.getByTeacher);
  router.get("/groups/student/:studentId", groupsController.getByStudent);
  router.get("/groups/:id", groupsController.getById);

  // Grupos (protegidas)
  router.post("/groups", auth, requireRole("maestro"), groupsController.create);
  router.patch("/groups/:id", auth, requireRole("maestro"), groupsController.update);
  router.delete("/groups/:id", auth, requireRole("maestro"), groupsController.remove);
  router.post("/groups/join", auth, requireRole("alumno"), groupsController.join);
  router.post("/groups/:id/leave", auth, requireRole("alumno"), groupsController.leave);
  router.get("/groups/:id/enrolled", auth, groupsController.isEnrolled);

  // Mensajes (SSE - eventos en tiempo real)
  router.get("/groups/:groupId/events", messagesController.subscribe);

  // Mensajes (lecturas)
  router.get("/groups/:groupId/messages", messagesController.getByGroup);
  router.get("/messages/:id", messagesController.getById);

  // Mensajes (protegidas)
  router.post("/messages", auth, messagesController.create);
  router.patch("/messages/:id", auth, messagesController.update);
  router.delete("/messages/:id", auth, messagesController.remove);

  return router;
}
