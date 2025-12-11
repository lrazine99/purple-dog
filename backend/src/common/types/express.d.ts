declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: string;
      sub?: number; // For JWT payload compatibility
    }
  }
}

export {};

