import app from "./app";
import { logger } from "./shared/logger";
import { checkConnection } from "./infraestructure/http/database/connection";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, async () => {
  logger.info(`Servidor iniciado en http://localhost:${PORT}`);
  logger.info(`Swagger UI en http://localhost:${PORT}/api-docs`);
  await checkConnection();
});
