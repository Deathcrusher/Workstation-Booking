declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email?: string;
      role: string;
      bandId?: string;
    };
  }
}

export {};
