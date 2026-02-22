import "express";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        role: "CUSTOMER" | "ADMIN";
      };
    }
  }
}

export {};
