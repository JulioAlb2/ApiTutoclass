import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { authConfig } from "./infraestructure/http/configure/auth.config";
import { swaggerSpec } from "./infraestructure/http/services/swagger/spec";
import { createRoutes } from "./infraestructure/http/routes";
import { errorHandler } from "./infraestructure/http/middleware/error.middleware";

import { UserRepositoryImpl } from "./infraestructure/http/repositories/UserRepositoryImpl";
import { GroupRepositoryImpl } from "./infraestructure/http/repositories/GroupRepositoryImpl";
import { MessageRepositoryImpl } from "./infraestructure/http/repositories/MessageRepositoryImpl";
import { TaskRepositoryImpl } from "./infraestructure/http/repositories/TaskRepositoryImpl";
import { SubmissionRepositoryImpl } from "./infraestructure/http/repositories/SubmissionRepositoryImpl";
import { HashService } from "./infraestructure/http/services/HashService";
import { TokenService } from "./infraestructure/http/services/TokenService";
import { SSEManager } from "./infraestructure/http/services/SSEManager";

import { RegisterAlumnoUseCase } from "./usecases/auth/RegisterAlumnoUseCase";
import { RegisterMaestroUseCase } from "./usecases/auth/RegisterMaestroUseCase";
import { LoginUseCase } from "./usecases/auth/LoginUseCase";
import { GetProfileUseCase } from "./usecases/auth/GetProfileUseCase";

import { CreateGroupUseCase } from "./usecases/groups/CreateGroupUseCase";
import { UpdateGroupUseCase } from "./usecases/groups/UpdateGroupUseCase";
import { DeleteGroupUseCase } from "./usecases/groups/DeleteGroupUseCase";
import { JoinGroupUseCase } from "./usecases/groups/JoinGroupUseCase";
import { LeaveGroupUseCase } from "./usecases/groups/LeaveGroupUseCase";

import { CreateMessageUseCase } from "./usecases/messages/CreateMessageUseCase";
import { UpdateMessageUseCase } from "./usecases/messages/UpdateMessageUseCase";
import { DeleteMessageUseCase } from "./usecases/messages/DeleteMessageUseCase";

import { CreateTaskUseCase } from "./usecases/tasks/CreateTaskUseCase";
import { UpdateTaskUseCase } from "./usecases/tasks/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "./usecases/tasks/DeleteTaskUseCase";
import { GetTasksByGroupUseCase } from "./usecases/tasks/GetTasksByGroupUseCase";

import { SubmitTaskUseCase } from "./usecases/submissions/SubmitTaskUseCase";
import { GradeSubmissionUseCase } from "./usecases/submissions/GradeSubmissionUseCase";
import { GetSubmissionsByTaskUseCase } from "./usecases/submissions/GetSubmissionsByTaskUseCase";

import { AuthController } from "./infraestructure/http/controllers/AuthController";
import { GroupsController } from "./infraestructure/http/controllers/GroupsController";
import { MessagesController } from "./infraestructure/http/controllers/MessagesController";
import { TasksController } from "./infraestructure/http/controllers/TasksController";
import { SubmissionsController } from "./infraestructure/http/controllers/SubmissionsController";

const app = express();

// Middleware global
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Documentación API (Swagger)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Repositorios
const userRepository = new UserRepositoryImpl();
const groupRepository = new GroupRepositoryImpl();
const messageRepository = new MessageRepositoryImpl();
const taskRepository = new TaskRepositoryImpl();
const submissionRepository = new SubmissionRepositoryImpl();

// Servicios
const hashService = new HashService(authConfig.bcrypt.saltRounds);
const tokenService = new TokenService();
const sseManager = new SSEManager();

// Casos de uso - Auth
const registerAlumnoUseCase = new RegisterAlumnoUseCase(
  userRepository,
  hashService,
  tokenService
);
const registerMaestroUseCase = new RegisterMaestroUseCase(
  userRepository,
  hashService,
  tokenService
);
const loginUseCase = new LoginUseCase(
  userRepository,
  hashService,
  tokenService
);
const getProfileUseCase = new GetProfileUseCase(userRepository);

// Casos de uso - Grupos
const createGroupUseCase = new CreateGroupUseCase(groupRepository);
const updateGroupUseCase = new UpdateGroupUseCase(groupRepository);
const deleteGroupUseCase = new DeleteGroupUseCase(groupRepository);
const joinGroupUseCase = new JoinGroupUseCase(groupRepository);
const leaveGroupUseCase = new LeaveGroupUseCase(groupRepository);

// Casos de uso - Mensajes
const createMessageUseCase = new CreateMessageUseCase(messageRepository);
const updateMessageUseCase = new UpdateMessageUseCase(messageRepository);
const deleteMessageUseCase = new DeleteMessageUseCase(messageRepository);

// Casos de uso - Tareas
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
const getTasksByGroupUseCase = new GetTasksByGroupUseCase(taskRepository);

// Casos de uso - Entregas
const submitTaskUseCase = new SubmitTaskUseCase(submissionRepository);
const gradeSubmissionUseCase = new GradeSubmissionUseCase(submissionRepository);
const getSubmissionsByTaskUseCase = new GetSubmissionsByTaskUseCase(submissionRepository);

// Controladores
const authController = new AuthController(
  registerAlumnoUseCase,
  registerMaestroUseCase,
  loginUseCase,
  getProfileUseCase
);
const groupsController = new GroupsController(
  groupRepository,
  createGroupUseCase,
  updateGroupUseCase,
  deleteGroupUseCase,
  joinGroupUseCase,
  leaveGroupUseCase
);
const messagesController = new MessagesController(
  messageRepository,
  createMessageUseCase,
  updateMessageUseCase,
  deleteMessageUseCase,
  sseManager
);
const tasksController = new TasksController(
  taskRepository,
  createTaskUseCase,
  updateTaskUseCase,
  deleteTaskUseCase,
  getTasksByGroupUseCase
);
const submissionsController = new SubmissionsController(
  submissionRepository,
  submitTaskUseCase,
  gradeSubmissionUseCase,
  getSubmissionsByTaskUseCase
);

// Rutas
const router = createRoutes(
  tokenService,
  authController,
  groupsController,
  messagesController,
  tasksController,
  submissionsController
);
app.use(router);

// Manejo de errores 
app.use(errorHandler);

export default app;
