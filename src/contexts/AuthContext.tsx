
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  profile: any;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, businessName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // Store registered users in memory

  const signUp = async (email: string, password: string, businessName: string) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      setLoading(false);
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = { email, password, businessName, id: Date.now() };
    setUsers(prev => [...prev, newUser]);
    setLoading(false);
    
    return newUser;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      setLoading(false);
      throw new Error('Invalid login credentials');
    }
    
    setUser(foundUser);
    setLoading(false);
    return foundUser;
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile: user ? { business_name: user.businessName } : null,
      isAuthenticated: !!user,
      loading, 
      signUp, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
