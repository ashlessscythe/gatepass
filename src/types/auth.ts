export type UserRole = "ADMIN" | "GUARD" | "DISPATCH" | "WAREHOUSE";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
}

export interface Session {
  user: User;
  expires: string;
}
