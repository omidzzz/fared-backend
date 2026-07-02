import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        phone?: string;
        email?: string;
      };
    }
  }
}

// Override Express 5 ParamsDictionary index signature: string | string[] → string
declare module "express-serve-static-core" {
  interface ParamsDictionary {
    [key: string]: string;
  }
}

export {};
