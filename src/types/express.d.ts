import 'express-session';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};
