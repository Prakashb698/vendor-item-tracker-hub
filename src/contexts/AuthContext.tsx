
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('mock_auth_users');
    const savedUser = localStorage.getItem('mock_auth_current_user');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  // Save users to localStorage whenever users array changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('mock_auth_users', JSON.stringify(users));
    }
  }, [users]);

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
    const newUser = { email, password, businessName, id: crypto.randomUUID() };
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
    localStorage.setItem('mock_auth_current_user', JSON.stringify(foundUser));
    setLoading(false);
    return foundUser;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('mock_auth_current_user');
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
