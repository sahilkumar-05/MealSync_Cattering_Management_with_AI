import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { connectSocket, disconnectSocket } from '../lib/socket';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  tenantId: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tenantId: null,
      setAuth: (token, user) => {
        set({ token, user, tenantId: user.tenantId });
        connectSocket(user.tenantId);
      },
      logout: () => {
        disconnectSocket();
        set({ token: null, user: null, tenantId: null });
      },
    }),
    { name: 'mealsync-auth' },
  ),
);