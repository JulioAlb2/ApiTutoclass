declare module "swagger-ui-express" {
  import type { RequestHandler } from "express";
  const serve: RequestHandler[];
  function setup(spec: object, options?: object): RequestHandler;
}
