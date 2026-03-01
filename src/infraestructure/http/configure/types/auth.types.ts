export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}