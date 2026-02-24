

export interface AuthConfig {
  accessToken: {
    secret: string;
    expiresIn: string; 
  };
  refreshToken: {
    secret: string;
    expiresIn: string;
  };
  bcrypt: {
    saltRounds: number;
  };
}

export const authConfig: AuthConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'SECRETACCESKEY',
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' 
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'SECRETREFRESSKEY',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
  }
};

