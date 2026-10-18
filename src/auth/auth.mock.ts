import { User } from './auth.types';

export const mockUser: User = {
  id: 'usr_123',
  name: 'Admin User',
  email: 'admin@example.com',
  roles: ['admin'],
  permissions: ['read:*', 'write:*'],
};
