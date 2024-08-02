import React, { createContext, useState, useContext, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  setAuthToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
  };
  const setAuthToken = (newToken: string) => setToken(newToken);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
