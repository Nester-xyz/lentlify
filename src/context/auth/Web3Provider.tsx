import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { familyAccountsConnector } from "family";
import { chains } from "@lens-chain/sdk/viem";

const config = createConfig(
  getDefaultConfig({
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http("https://rpc.lenschain.xyz"),
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
