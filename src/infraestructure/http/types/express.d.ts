import type { DecodedToken } from "../configure/types/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export {};
