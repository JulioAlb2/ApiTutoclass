import jwt from "jsonwebtoken";
import type { TokenPayload, DecodedToken } from "../configure/types/auth.types";
import { authConfig } from "../configure/auth.config";
import { getErrorMessage } from "../../../shared/errors/getErrorMessage";

export class TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = authConfig.token.secret;
    this.expiresIn = authConfig.token.expiresIn;
  }

  generateToken(payload: TokenPayload): string {
    try {
      return jwt.sign(
        payload,
        this.secret,
        { expiresIn: this.expiresIn } as jwt.SignOptions,
      );
    } catch (error) {
      throw new Error(`Error al generar token: ${getErrorMessage(error)}`);
    }
  }

  verifyToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, this.secret) as DecodedToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expirado");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Token inválido");
      }
      throw new Error(
        `Error al verificar token: ${getErrorMessage(error)}`,
      );
    }
  }
}
