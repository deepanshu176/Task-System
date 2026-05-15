import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string | { name?: string } | null;
  isActive: boolean;
  permissions: string[];
}

interface AuthState {
  user: NormalizedUser | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

interface NormalizedUser extends Omit<User, 'role' | 'permissions'> {
  role: string | null;
  permissions: string[];
}

const normalizeUser = (user: User): NormalizedUser => ({
  ...user,
  role: typeof user.role === 'object' ? user.role?.name || null : user.role,
  permissions: Array.isArray(user.permissions)
    ? user.permissions.map((permission: unknown) => {
        if (typeof permission === 'string') return permission;
        if (permission && typeof permission === 'object' && 'name' in permission) {
          return String((permission as { name: string }).name);
        }
        return '';
      }).filter(Boolean)
    : [],
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user: normalizeUser(user), token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
