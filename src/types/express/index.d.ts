import { Request, Response, NextFunction, Router } from 'express';

declare global {
  interface CustomRequest extends Request {
    user?: any;
  }
}

export { Request, Response, NextFunction, Router };