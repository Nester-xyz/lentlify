import { createContext, useContext, useState } from "react";
import type { Address } from "viem";

interface SessionContextType {
  sessionClient: any | null;
  setSessionClient: (client: any | null) => void;
  loggedInUsername: string;
  activeLensAddress?: Address;
  setActiveLensAddress: (address: Address) => void;
  setLoggedInUsername: (username: string) => void;
  authenticatedValue: string;
  setAuthenticatedValue: (value: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionClient, setSessionClient] = useState<any | null>(null);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [activeLensAddress, setActiveLensAddress] = useState(`0x00` as Address);
  const [authenticatedValue, setAuthenticatedValue] = useState("");

  const setSessionWithLogging = (client: any | null) => {
    console.log("Setting session client:", client);
    setSessionClient(client);
  };

  return (
    <SessionContext.Provider
      value={{
        sessionClient,
        setSessionClient: setSessionWithLogging,
        loggedInUsername,
        activeLensAddress,
        setActiveLensAddress,
        setLoggedInUsername,
        authenticatedValue,
        setAuthenticatedValue,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionClient = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionClient must be used within a SessionProvider");
  }
  return context;
};
