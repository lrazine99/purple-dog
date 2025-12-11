import type { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id: number;
    sub?: number;
    email?: string;
    role?: string;
  };
}

