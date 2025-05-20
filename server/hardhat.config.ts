import "@matterlabs/hardhat-zksync";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  zksolc: {
    version: "1.5.12",
    settings: {},
  },
  networks: {
    lensTestnet: {
      chainId: 37111,
      ethNetwork: "sepolia", // or a Sepolia RPC endpoint from Infura/Alchemy/Chainstack etc.
      url: "https://api.staging.lens.zksync.dev",
      verifyURL:
        "https://api-explorer-verify.staging.lens.zksync.dev/contract_verification",
      zksync: true,
    },
    lensMainnet: {
      chainId: 232,
      url: "https://api.lens.matterhosted.dev/",
      ethNetwork: `https://eth-sepolia.g.alchemy.com/v2/7YCBJn_-s2h9BA_r2-SWrcqsUqgWHqdR`, // dont think you need this
      zksync: true,
      verifyURL:
        "https://api-explorer-verify.lens.matterhosted.dev/contract_verification",
    },
    hardhat: {
      zksync: true,
      loggingEnabled: true,
    },
  },
};

export default config;