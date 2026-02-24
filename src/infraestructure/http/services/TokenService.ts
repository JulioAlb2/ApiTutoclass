// services/token.service.ts
import jwt from "jsonwebtoken";
import {
  TokenPayload,
  Tokens,
  DecodedToken,
} from "../configure/types/auth.types";
import { authConfig } from "../configure/auth.config";
import { getErrorMessage } from "../../../shared/errors/getErrorMessage";

export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.accessSecret = authConfig.accessToken.secret;
    this.refreshSecret = authConfig.refreshToken.secret;
    this.accessExpiresIn = authConfig.accessToken.expiresIn;
    this.refreshExpiresIn = authConfig.refreshToken.expiresIn;
  }

  generateTokens(payload: TokenPayload): Tokens {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(`Error al generar tokens: ${getErrorMessage(error)}`);
    }
  }

  generateAccessToken(payload: any): string {
    try {
      return jwt.sign(
        payload,
        this.accessSecret as string,
        { expiresIn: this.accessExpiresIn } as jwt.SignOptions,
      );
    } catch (error) {
      throw new Error(
        `Error al generar access token: ${getErrorMessage(error)}`,
      );
    }
  }

  generateRefreshToken(payload: any): string {
    try {
      return jwt.sign(
        payload,
        this.refreshSecret as string,
        { expiresIn: this.refreshExpiresIn } as jwt.SignOptions,
      );
    } catch (error) {
      throw new Error(
        `Error al generar refresh token: ${getErrorMessage(error)}`,
      );
    }
  }

  verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as DecodedToken;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token expirado");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Access token inválido");
      }
      throw new Error(
        `Error al verificar access token: ${getErrorMessage(error)}`,
      );
    }
  }
}
