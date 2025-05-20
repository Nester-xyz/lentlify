import React, { useState, useEffect } from "react";
import { useBalance, usePublicClient } from "wagmi";
import type { Address } from "viem";
import { decodeEventLog } from "viem";
import { QRCodeCanvas } from "qrcode.react";
import grassTokenLogo from "../../assets/GRASS_TOKEN_LOGO.png";
import { UseAuth } from "@/context/auth/AuthContext";
import { FiCopy } from "react-icons/fi";
import TransactionHistory from "../../components/TransactionHistory";
import type { Transaction } from "../../components/TransactionHistory";
import { contractAddress } from "../../constants/addresses";
import { abi } from "../../constants/abi";

type AbiItemFromConst = (typeof abi)[number];
type EventAbiFromConst = Extract<AbiItemFromConst, { type: "event" }>;

const WalletPage: React.FC = () => {
  const { selectedAccount } = UseAuth();
  const publicClient = usePublicClient();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    string | undefined
  >(() => {
    const savedAddress = localStorage.getItem("smartAccountAddress");
    return savedAddress || selectedAccount?.address;
  });
  const [copied, setCopied] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const { data: balanceData } = useBalance({
    address: smartAccountAddress as Address,
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

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicClient || !contractAddress || !smartAccountAddress) {
        setIsLoadingTransactions(false);
        setTransactions([]);
        if (!smartAccountAddress && selectedAccount?.address) {
          setTransactionError(
            "Smart account address not yet available, will retry..."
          );
        } else if (!smartAccountAddress) {
          setTransactionError(
            "Please connect your wallet to see transaction history."
          );
        } else {
          setTransactionError("Client or contract address not available.");
        }
        return;
      }

      setIsLoadingTransactions(true);
      setTransactionError(null);

      try {
        const eventsToFilter = [
          { name: "CampaignCreated", filterArgName: "seller" },
          { name: "CampaignGroupCreated", filterArgName: "owner" },
          { name: "DepositsRefunded", filterArgName: "seller" },
          { name: "DisplayFeeRefunded", filterArgName: "seller" },
        ];

        const logsPromises = eventsToFilter
          .map(({ name, filterArgName }) => {
            const eventAbi = abi.find(
              (item): item is EventAbiFromConst =>
                item.type === "event" && item.name === name
            );
            if (!eventAbi) {
              console.warn(`ABI for event ${name} not found.`);
              return null;
            }

            const args: Record<string, Address> = {};
            args[filterArgName] = smartAccountAddress as Address;

            return publicClient.getLogs({
              address: contractAddress as Address,
              event: eventAbi,
              args: args,
              fromBlock: "earliest",
              toBlock: "latest",
            });
          })
          .filter((promise): promise is Promise<any> => promise !== null);

        if (logsPromises.length === 0) {
          setTransactions([]);
          setIsLoadingTransactions(false);
          return;
        }

        const logsResults = await Promise.all(logsPromises);
        const allLogs = logsResults.flat();

        allLogs.sort((a, b) => {
          if (a.blockNumber === null || b.blockNumber === null) return 0;
          if (a.blockNumber !== b.blockNumber) {
            return Number(a.blockNumber) - Number(b.blockNumber);
          }
          if (a.logIndex === null || b.logIndex === null) return 0;
          return Number(a.logIndex) - Number(b.logIndex);
        });

        const blockPromises = allLogs.map((log) =>
          log.blockHash
            ? publicClient.getBlock({ blockHash: log.blockHash })
            : Promise.resolve(null)
        );
        const blocks = await Promise.all(blockPromises);

        const formattedTransactions: Transaction[] = allLogs.map(
          (log, index) => {
            const eventNameFromLog = (log as any).eventName;
            const eventAbiItem = abi.find(
              (item): item is EventAbiFromConst =>
                item.type === "event" && item.name === eventNameFromLog
            ) as EventAbiFromConst | undefined;

            let decodedData: Record<string, any> = {};
            if (eventAbiItem && log.data && Array.isArray(log.topics)) {
              try {
                const decoded = decodeEventLog({
                  abi: [eventAbiItem] as const,
                  data: log.data,
                  topics: log.topics as any,
                });
                decodedData = decoded.args || {};
              } catch (e) {
                console.error("Error decoding event log:", e, log);
                decodedData = { error: "Failed to decode event data" };
              }
            }

            const block = blocks[index];

            return {
              id:
                log.transactionHash || `log-${log.blockNumber}-${log.logIndex}`,
              eventName: eventNameFromLog || "Unknown Event",
              blockNumber: Number(log.blockNumber) || 0,
              timestamp: block ? Number(block.timestamp) : undefined,
              data: decodedData,
            };
          }
        );

        setTransactions(formattedTransactions.reverse());
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactionError(
          "Failed to load transaction history. Check console for details."
        );
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [publicClient, smartAccountAddress]);

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

      <div className="m-6">
        <TransactionHistory
          transactions={transactions}
          isLoading={isLoadingTransactions}
          error={transactionError}
        />
      </div>
    </div>
  );
};

export default WalletPage;
