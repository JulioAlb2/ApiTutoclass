import type { DecodedToken } from "../configure/types/auth.types.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedToken;
  }
}
