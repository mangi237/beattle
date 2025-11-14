import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('user created account successfully');
    } catch (error: any) {
      console.error('Signup error:', error);
      switch (error) {
  
           case 'auth/email-already-in-use':
          setError('That email address is already in use!');
          break;
        case 'auth/invalid-email':
          setError('That email address is invalid!');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long!');
          break;
        default:
          setError('An unknown error occurred. Please try again.');
          break;
      
       
      }
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('user logged in successfully');
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    logout,
    login,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};