
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  businessName?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean }>;
  signUp: (email: string, password: string, businessName: string, role?: 'admin' | 'customer') => Promise<{ success: boolean }>;
  signOut: () => void;
  loading: boolean;
}
