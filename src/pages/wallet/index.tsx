import React, { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import type { Address } from "viem";
import grassTokenLogo from "../../assets/GRASS_TOKEN_LOGO.png";
import { UseAuth } from "@/context/auth/AuthContext";

const WalletPage: React.FC = () => {
  const { selectedAccount } = UseAuth();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    string | undefined
  >(() => {
    const savedAddress = localStorage.getItem("smartAccountAddress");
    return savedAddress || selectedAccount?.address;
  });

  const { data: balanceData } = useBalance({
    address: smartAccountAddress as Address,
  });

  useEffect(() => {
    if (!selectedAccount?.address) return;
    setSmartAccountAddress(selectedAccount.address);
    localStorage.setItem("smartAccountAddress", selectedAccount.address);
  }, [selectedAccount]);

  return (
    <div className="wallet-page max-w-md mx-auto p-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Wallet
      </h1>
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
        <div className="mb-5">
          <strong className="text-gray-700 dark:text-gray-300">Balance:</strong>
          <div className="text-2xl font-semibold text-green-400 flex items-center gap-2">
            {balanceData
              ? parseFloat(balanceData.formatted).toFixed(4)
              : "0.0000"}
            <img
              src={grassTokenLogo}
              alt="GRASS"
              className="inline-block w-8 h-8"
            />
          </div>
        </div>
        <div className="mb-5">
          <strong className="text-gray-700 dark:text-gray-300">Address:</strong>
          <div className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
            {smartAccountAddress || "Not connected"}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold transition">
            Deposit
          </button>
          <button className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-md font-semibold transition">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
