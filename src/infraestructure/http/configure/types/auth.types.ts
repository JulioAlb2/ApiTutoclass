export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export const authConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'access_secret_key',
    expiresIn: '15m'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    expiresIn: '7d'
  }
};