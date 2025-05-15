import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { client } from "../../lib/lens";
import type { TProfile } from "@/types/User";
import type { Dispatch, SetStateAction } from "react";

const LOGOUT_FLAG = "lentlify_logged_out";

type AuthContextType = {
  isAuthorized: boolean;
  sessionClient: any | null;
  login: (client: any) => void;
  logout: () => void;
  isLoading: boolean;
  selectedAccount: any | null;
  setSelectedAccount: (account: any | null) => void;
  profile?: TProfile;
  setProfile: Dispatch<SetStateAction<TProfile | undefined>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setAuthorized] = useState(false);
  const [sessionClient, setSessionClient] = useState<any | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [profile, setProfile] = useState<TProfile | undefined>(() => {
    const stored = window.localStorage.getItem("sidebarProfile");
    return stored ? JSON.parse(stored) : undefined;
  });

  const login = (client: any) => {
    try {
      window.localStorage.removeItem(LOGOUT_FLAG);
    } catch {}
    setSessionClient(client);
    setAuthorized(true);
  };

  const logout = () => {
    setSessionClient(null);
    setAuthorized(false);
    setSelectedAccount(null);
    setProfile(undefined);
    try {
      window.localStorage.setItem(LOGOUT_FLAG, "true");
      window.localStorage.removeItem("sidebarProfile");
    } catch {}
  };

  useEffect(() => {
    (async () => {
      if (window.localStorage.getItem(LOGOUT_FLAG)) {
        setLoading(false);
        return;
      }
      const resumed = await client.resumeSession();
      if (resumed.isOk()) {
        login(resumed.value);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    try {
      if (profile) {
        window.localStorage.setItem("sidebarProfile", JSON.stringify(profile));
      } else {
        window.localStorage.removeItem("sidebarProfile");
      }
    } catch {}
  }, [profile]);

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
        profile,
        setProfile,
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
