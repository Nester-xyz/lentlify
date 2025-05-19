import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { familyAccountsConnector } from "family";
import { chains } from "@lens-chain/sdk/viem";

const config = createConfig(
  getDefaultConfig({
    chains: [chains.testnet],
    transports: {
      [chains.testnet.id]: http("https://lens-sepolia.g.alchemy.com/v2/-pqdDgazXsQHCMOHRftVSQkTtFX66H8_"),
    },
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    appName: "Lentlify",
    appDescription: "Your App Description",
    connectors: [familyAccountsConnector()],
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
