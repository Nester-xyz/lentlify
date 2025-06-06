import React from "react";

export interface Transaction {
  id: string;
  eventName: string;
  blockNumber: number;
  timestamp?: number;
  data: Record<string, any>;
  explorerLink?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: string | null;
}

const formatTimeAgo = (timestamp?: number): string => {
  if (timestamp === undefined || timestamp === null) return "N/A";
  const now = new Date().getTime();
  const seconds = Math.round((now - timestamp * 1000) / 1000);

  if (seconds < 30) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading,
  error,
}) => {
  // const renderTransactionData = (data: Record<string, any>) => {
  //   return Object.entries(data)
  //     .map(([key, value]) => {
  //       let displayValue = value;
  //       if (typeof value === "object" && value !== null) {
  //         displayValue = JSON.stringify(value);
  //       } else if (typeof value === "boolean") {
  //         displayValue = value ? "Yes" : "No";
  //       } else if (value === undefined || value === null || value === "") {
  //         displayValue = "N/A";
  //       }
  //       return (
  //         <div key={key} className="text-xs">
  //           <span className="font-semibold">{key}:</span> {String(displayValue)}
  //         </div>
  //       );
  //     })
  //     .slice(0, 3); // Show first 3 data points for brevity
  // };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading transaction history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 dark:text-red-400">
        Error loading transactions: {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No transactions found for this campaign contract.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Campaign Transaction History
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Event
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Explorer
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tx.eventName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(tx.timestamp)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tx.explorerLink ? (
                    <a
                      href={tx.explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </a>
                  ) : (
                    tx.id.startsWith("0x") && (
                      <a
                        href={`https://explorer.testnet.lens.xyz/tx/${tx.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </a>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
