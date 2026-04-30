export type UserRole = "admin" | "volunteer";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
