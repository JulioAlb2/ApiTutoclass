declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      rol: string;
      iat: number;
      exp: number;
    };
  }
}
