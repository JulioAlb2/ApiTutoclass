export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "ApiTutoClass",
    version: "1.0.0",
    description: "API REST para aula virtual: usuarios (maestros/alumnos), grupos y mensajes.",
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token obtenido en login o registro (Authorization: Bearer <token>)",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              nombre: { type: "string" },
              email: { type: "string" },
              rol: { type: "string", enum: ["maestro", "alumno"] },
            },
          },
          token: { type: "string", description: "JWT válido por 7 días" },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          email: { type: "string" },
          rol: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Group: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          subject: { type: "string" },
          description: { type: "string", nullable: true },
          teacherId: { type: "integer" },
          teacherName: { type: "string" },
          date: { type: "string", format: "date-time" },
          accessCode: { type: "string" },
          status: { type: "string", enum: ["activa", "finalizada"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Message: {
        type: "object",
        properties: {
          id: { type: "integer" },
          groupId: { type: "integer" },
          userId: { type: "integer" },
          userName: { type: "string" },
          userRole: { type: "string" },
          text: { type: "string" },
          type: { type: "string", enum: ["texto", "sistema"] },
          createdAt: { type: "string", format: "date-time" },
          edited: { type: "boolean" },
          editedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/auth/register/alumno": {
      post: {
        tags: ["Auth"],
        summary: "Registro de alumno",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre", "email", "password"],
                properties: {
                  nombre: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } }
          },
          400: {
            description: "Email ya registrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/auth/register/maestro": {
      post: {
        tags: ["Auth"],
        summary: "Registro de maestro",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre", "email", "password"],
                properties: {
                  nombre: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                  materias: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } }
          },
          400: {
            description: "Email ya registrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } }
          },
          400: {
            description: "Credenciales inválidas",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Perfil del usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserProfile" } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/groups": {
      get: {
        tags: ["Grupos"],
        summary: "Listar grupos activos",
        responses: {
          200: {
            description: "Lista de grupos",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Group" } } } }
          },
        },
      },
      post: {
        tags: ["Grupos"],
        summary: "Crear grupo (maestro)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "subject", "accessCode"],
                properties: {
                  name: { type: "string" },
                  subject: { type: "string" },
                  description: { type: "string" },
                  teacherName: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  accessCode: { type: "string" },
                  status: { type: "string", enum: ["activa", "finalizada"] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Grupo creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Group" } } }
          },
          400: {
            description: "Código ya en uso",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          403: {
            description: "Solo maestros",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/groups/teacher/{teacherId}": {
      get: {
        tags: ["Grupos"],
        summary: "Grupos de un profesor",
        parameters: [{ name: "teacherId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Lista de grupos",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Group" } } } }
          },
        },
      },
    },
    "/groups/student/{studentId}": {
      get: {
        tags: ["Grupos"],
        summary: "Grupos de un alumno",
        parameters: [{ name: "studentId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Lista de grupos",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Group" } } } }
          },
        },
      },
    },
    "/groups/join": {
      post: {
        tags: ["Grupos"],
        summary: "Unirse a un grupo con código (alumno)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["accessCode"],
                properties: { accessCode: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Inscrito",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Group" } } }
          },
          400: {
            description: "Código inválido, grupo inactivo o ya inscrito",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          403: {
            description: "Solo alumnos",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/groups/{id}": {
      get: {
        tags: ["Grupos"],
        summary: "Detalle de un grupo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Group" } } }
          },
          404: {
            description: "Grupo no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
      patch: {
        tags: ["Grupos"],
        summary: "Actualizar grupo (maestro)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  subject: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  status: { type: "string", enum: ["activa", "finalizada"] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Grupo actualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Group" } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          403: {
            description: "Solo maestros",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Grupo no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
      delete: {
        tags: ["Grupos"],
        summary: "Eliminar grupo (maestro)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          204: { description: "Eliminado" },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          403: {
            description: "Solo maestros",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Grupo no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/groups/{id}/leave": {
      post: {
        tags: ["Grupos"],
        summary: "Salir del grupo (alumno)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          204: { description: "Dado de baja" },
          400: {
            description: "No inscrito",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          403: {
            description: "Solo alumnos",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Grupo no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/groups/{id}/enrolled": {
      get: {
        tags: ["Grupos"],
        summary: "¿Usuario inscrito en el grupo?",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { type: "object", properties: { enrolled: { type: "boolean" } } } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Grupo no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/groups/{id}/students": {
      get: {
        tags: ["Grupos"],
        summary: "Listar alumnos inscritos en un grupo",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Lista de alumnos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      email: { type: "string" },
                      joinedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Grupo no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/groups/{groupId}/events": {
      get: {
        tags: ["Mensajes"],
        summary: "SSE — Eventos en tiempo real de un grupo",
        description: "Abre una conexión Server-Sent Events. El servidor envía eventos `message_created`, `message_updated` y `message_deleted` cada vez que un mensaje cambia en el grupo.",
        parameters: [
          { name: "groupId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Stream de eventos (text/event-stream)",
            content: { "text/event-stream": { schema: { type: "string" } } }
          },
        },
      },
    },
    "/groups/{groupId}/messages": {
      get: {
        tags: ["Mensajes"],
        summary: "Mensajes de un grupo",
        parameters: [
          { name: "groupId", in: "path", required: true, schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          200: {
            description: "Lista de mensajes",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Message" } } } }
          },
        },
      },
    },
    "/messages/{id}": {
      get: {
        tags: ["Mensajes"],
        summary: "Un mensaje por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } }
          },
          404: {
            description: "Mensaje no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
      patch: {
        tags: ["Mensajes"],
        summary: "Editar mensaje",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: { text: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Mensaje actualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } }
          },
          400: {
            description: "Texto vacío",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Mensaje no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
      delete: {
        tags: ["Mensajes"],
        summary: "Eliminar mensaje",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          204: { description: "Eliminado" },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Mensaje no encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/messages": {
      post: {
        tags: ["Mensajes"],
        summary: "Crear mensaje",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["groupId", "text"],
                properties: {
                  groupId: { type: "integer" },
                  userName: { type: "string" },
                  text: { type: "string" },
                  type: { type: "string", enum: ["texto", "sistema"] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Mensaje creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } }
          },
          400: {
            description: "Texto vacío",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "No autenticado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    }
  }
};