import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { client } from "../../lib/lens";
import type { TProfile } from "@/types/User";

const LOGOUT_FLAG = "lentlify_logged_out";

type AuthContextType = {
  isAuthorized: boolean;
  sessionClient: any | null;
  login: (client: any) => void;
  logout: () => void;
  isLoading: boolean;
  selectedAccount: any | null;
  setSelectedAccount: (account: any | null) => void;
  profile: TProfile;
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
        profile: {
          address: "0x1234567890abcdef1234567890abcdef12345678",
          bio: "This is a sample bio",
          name: "Sample User",
          coverPicture: "https://example.com/cover.jpg",
          createdAt: "2023-01-01T00:00:00Z",
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function UseAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth must be used within AuthProvider");
  }
  return context;
}
