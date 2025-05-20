import React, { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import type { Address } from "viem";
import { QRCodeCanvas } from "qrcode.react";
import grassTokenLogo from "../../assets/GRASS_TOKEN_LOGO.png";
import { UseAuth } from "@/context/auth/AuthContext";
import { FiCopy } from "react-icons/fi";

const WalletPage: React.FC = () => {
  const { selectedAccount } = UseAuth();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    string | undefined
  >(() => {
    const savedAddress = localStorage.getItem("smartAccountAddress");
    return savedAddress || selectedAccount?.address;
  });
  const [copied, setCopied] = useState(false);

  const { data: balanceData } = useBalance({
    address: smartAccountAddress as Address,
    chainId: 11155111, // Sepolia testnet
  });

  useEffect(() => {
    if (selectedAccount?.address) {
      setSmartAccountAddress(selectedAccount.address);
      localStorage.setItem("smartAccountAddress", selectedAccount.address);
    } else {
      const savedAddress = localStorage.getItem("smartAccountAddress");
      if (!savedAddress) {
        setSmartAccountAddress(undefined);
        localStorage.removeItem("smartAccountAddress");
      }
    }
  }, [selectedAccount]);

  const formatAddress = (address: string | undefined) => {
    if (!address) return "Not connected";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const copyToClipboard = () => {
    if (smartAccountAddress) {
      navigator.clipboard.writeText(smartAccountAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className=" bg-white dark:bg-gray-900 min-h-screen">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white px-4">
          Your Smart Wallet
        </h1>
        <div className="border-b border-gray-200 dark:border-gray-700 mt-4"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-stretch m-6 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 w-full md:w-2/3">
          <div className="mb-5">
            <strong className="text-gray-700 dark:text-gray-300">
              Balance:
            </strong>
            <div className="text-2xl font-semibold text-green-400 flex items-center gap-2">
              {balanceData && parseFloat(balanceData.formatted).toFixed(4)}
              <img
                src={grassTokenLogo}
                alt="GHO"
                className="inline-block w-8 h-8"
              />
            </div>
          </div>
          <div className="mb-5">
            <strong className="text-gray-700 dark:text-gray-300">
              Address:
            </strong>
            <div className="flex items-center gap-2">
              <div className="font-mono text-lg text-gray-900 dark:text-gray-100 break-all">
                {formatAddress(smartAccountAddress)}
              </div>
              {smartAccountAddress && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Copy address"
                >
                  {copied ? (
                    <div className="text-md">Copied!</div>
                  ) : (
                    <FiCopy size={18} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        {smartAccountAddress && (
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 w-full md:w-1/3 flex flex-col items-center">
            <div className="mb-4">
              <QRCodeCanvas
                value={smartAccountAddress}
                size={160}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Scan to deposit funds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
