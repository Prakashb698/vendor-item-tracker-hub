
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'customer',
        businessName: email.includes('admin') ? 'Admin Panel' : 'Customer Business',
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      // Clear any existing inventory data from previous sessions
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('inventory-storage')) {
          localStorage.removeItem(key);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, businessName: string, role: 'admin' | 'customer' = 'customer') => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        role,
        businessName,
        createdAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      // Clear any existing inventory data for fresh start
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('inventory-storage')) {
          localStorage.removeItem(key);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Clear all inventory-related localStorage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('inventory-storage')) {
        localStorage.removeItem(key);
      }
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
