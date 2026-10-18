export type UserRole = 'admin' | 'sis' | 'instructor' | 'student' | 'guardian';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

