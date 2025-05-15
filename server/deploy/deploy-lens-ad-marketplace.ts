import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();

  // Check for required environment variables
  const paymentToken = process.env.PAYMENT_TOKEN;
  const feeCollector = process.env.FEE_COLLECTOR;
  const graphAddress = process.env.GRAPH_ADDRESS;
  const actionHub = process.env.ACTION_HUB;

  if (!paymentToken) {
    throw new Error("PAYMENT_TOKEN environment variable is not set");
  }

  if (!feeCollector) {
    throw new Error("FEE_COLLECTOR environment variable is not set");
  }

  if (!graphAddress) {
    console.warn("GRAPH_ADDRESS environment variable is not set. Using default address(0).");
  }

  if (!actionHub) {
    console.warn("ACTION_HUB environment variable is not set. Using default address(0).");
  }

  console.log("Deploying LensAdCampaignMarketplace with the following parameters:");
  console.log(`Payment Token: ${paymentToken}`);
  console.log(`Fee Collector: ${feeCollector}`);
  console.log(`Graph Address: ${graphAddress || "0x0000000000000000000000000000000000000000"}`);
  console.log(`Action Hub: ${actionHub || "0x0000000000000000000000000000000000000000"}`);

  // Deploy the LensAdCampaignMarketplace contract
  const marketplace = await deployContract(
    "LensAdCampaignMarketplace",
    [
      paymentToken,
      feeCollector,
      graphAddress || "0x0000000000000000000000000000000000000000",
      actionHub || "0x0000000000000000000000000000000000000000"
    ],
    {
      hre,
      wallet,
      verify: true,
    }
  );

  const marketplaceAddress = await marketplace.getAddress();
  console.log(`LensAdCampaignMarketplace deployed at: ${marketplaceAddress}`);

  return { marketplace: marketplaceAddress };
}
