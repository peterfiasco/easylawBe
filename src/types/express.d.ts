import 'express';

// This is important - declare this to make the module augmentation work
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

// This makes the file a module
export {};
