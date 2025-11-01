import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import { saveToken, removeToken, hasToken } from '@/service/auth.service';

type AuthContextData = {
  isLogged: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    async function loadToken() {
      const logged = await hasToken();
      setIsLogged(logged);
    }
    loadToken();
  }, []);

  async function signIn(token: string) {
    await saveToken(token);
    setIsLogged(true);
  }

  async function signOut() {
    await removeToken();
    setIsLogged(false);
  }

  return (
    <AuthContext.Provider value={{ isLogged, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
