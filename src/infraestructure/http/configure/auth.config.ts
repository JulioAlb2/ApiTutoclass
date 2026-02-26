

export interface AuthConfig {
  token: {
    secret: string;
    expiresIn: string;
  };
  bcrypt: {
    saltRounds: number;
  };
}

export const authConfig: AuthConfig = {
  token: {
    secret: process.env.JWT_SECRET || 'SECRETKEY',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
  }
};

export interface RegisterAlumnoDTO {
  nombre: string;
  email: string;
  password: string;
  rol: 'alumno';
}

export interface RegisterMaestroDTO {
  nombre: string;
  email: string;
  password: string;
  rol: 'maestro';
  materias?: string[];
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
  token: string;
}

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  createdAt: Date;
}

