import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { client } from "../../lib/lens";

const LOGOUT_FLAG = "lentlify_logged_out";

type AuthContextType = {
  isAuthorized: boolean;
  sessionClient: string | null;
  login: (client: string) => void;
  logout: () => void;
  isLoading: boolean;
  selectedAccount: string | null;
  setSelectedAccount: (account: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setAuthorized] = useState(false);
  const [sessionClient, setSessionClient] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const login = (client: string) => {
    try {
      window.localStorage.removeItem(LOGOUT_FLAG);
    } catch {
      // localStorage not available or user is in private mode
    }
    setSessionClient(client);
    setAuthorized(true);
  };

  const logout = () => {
    setSessionClient(null);
    setAuthorized(false);
    try {
      window.localStorage.setItem(LOGOUT_FLAG, "true");
    } catch {
      // localStorage write failed
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (window.localStorage.getItem(LOGOUT_FLAG)) {
          setLoading(false);
          return;
        }

        const resumed = await client.resumeSession();
        if (resumed.isOk()) {
          login(resumed.value.toString());
        }
      } catch {
        // Resume session failed or localStorage not accessible
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthorized,
        sessionClient,
        login,
        logout,
        isLoading,
        selectedAccount,
        setSelectedAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function UseAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
