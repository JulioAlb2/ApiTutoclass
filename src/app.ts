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
import { HashService } from "./infraestructure/http/services/HashService";
import { TokenService } from "./infraestructure/http/services/TokenService";

import { RegisterAlumnoUseCase } from "./usecases/auth/RegisterAlumnoUseCase";
import { RegisterMaestroUseCase } from "./usecases/auth/RegisterMaestroUseCase";
import { LoginUseCase } from "./usecases/auth/LoginUseCase";
import { RefreshTokenUseCase } from "./usecases/auth/RefreshTokenUseCase";
import { GetProfileUseCase } from "./usecases/auth/GetProfileUseCase";

import { CreateGroupUseCase } from "./usecases/groups/CreateGroupUseCase";
import { UpdateGroupUseCase } from "./usecases/groups/UpdateGroupUseCase";
import { DeleteGroupUseCase } from "./usecases/groups/DeleteGroupUseCase";
import { JoinGroupUseCase } from "./usecases/groups/JoinGroupUseCase";
import { LeaveGroupUseCase } from "./usecases/groups/LeaveGroupUseCase";

import { CreateMessageUseCase } from "./usecases/messages/CreateMessageUseCase";
import { UpdateMessageUseCase } from "./usecases/messages/UpdateMessageUseCase";
import { DeleteMessageUseCase } from "./usecases/messages/DeleteMessageUseCase";

import { AuthController } from "./infraestructure/http/controllers/AuthController";
import { GroupsController } from "./infraestructure/http/controllers/GroupsController";
import { MessagesController } from "./infraestructure/http/controllers/MessagesController";

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

// Servicios
const hashService = new HashService(authConfig.bcrypt.saltRounds);
const tokenService = new TokenService();

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
const refreshTokenUseCase = new RefreshTokenUseCase(
  userRepository,
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

// Controladores
const authController = new AuthController(
  registerAlumnoUseCase,
  registerMaestroUseCase,
  loginUseCase,
  refreshTokenUseCase,
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
  deleteMessageUseCase
);

// Rutas
const router = createRoutes(
  tokenService,
  authController,
  groupsController,
  messagesController
);
app.use(router);

// Manejo de errores 
app.use(errorHandler);

export default app;
