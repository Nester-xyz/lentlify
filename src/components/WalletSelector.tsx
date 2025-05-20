import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { KeyIcon } from "@heroicons/react/24/outline";
import familyIcon from "../assets/family.png";

import { useEffect, useState } from "react";
import { Spinner } from "./atoms/Spinner";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { client } from "../lib/lens";
import { IconlyArrowRightCircle } from "./IconlyArrowRightCircle";
import { UseAuth } from "../context/auth/AuthContext";
import { ConnectKitButton } from "connectkit";

const WALLET_META = {
  familyAccountsProvider: { label: "Login with Family", logo: familyIcon },
};

export default function WalletSelector() {
  const {
    login,
    logout,
    isAuthorized,
    sessionClient,
    selectedAccount,
    setSelectedAccount,
  } = UseAuth();
  const { connector: active, address } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const { signMessageAsync } = useSignMessage();

  // Use environment variables for app IDs
  const APP_ID = import.meta.env.VITE_LENS_APP_ID;
  console.log(APP_ID);

  // Restore account from localStorage on component mount
  useEffect(() => {
    if (!selectedAccount) {
      const savedAccount = localStorage.getItem("selectedAccount");
      if (savedAccount) {
        try {
          const accountData = JSON.parse(savedAccount);
          setSelectedAccount(accountData);
        } catch (e) {
          console.error("Failed to parse saved account data:", e);
        }
      }
    }
  }, [selectedAccount, setSelectedAccount]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (address) {
        setLoadingAccounts(true);
        setError(null);
        console.log("[WalletSelector] fetchAccounts: address:", address);
        try {
          const result = await fetchAccountsAvailable(client, {
            managedBy: evmAddress(address),
            includeOwned: true,
          });
          if (result.isOk()) {
            const items = result.value.items;
            console.log(items);
            setAccounts(
              items.map((item: any) => ({
                ...item.account,
                id: item.account.id || item.account.address,
                image: item.account.metadata?.picture || undefined,
              }))
            );
          } else {
            console.error("fetch error:", result.error);
            setError("Failed to fetch accounts");
          }
        } catch (e: any) {
          console.error("[WalletSelector] fetchAccounts: error:", e);
          setError("Failed to fetch accounts: " + (e.message || e.toString()));
        } finally {
          setLoadingAccounts(false);
        }
      } else {
        console.warn("[WalletSelector] fetchAccounts: No address found");
      }
    };
    fetchAccounts();
  }, [address]);

  // Login handler for selected account
  const handleLogin = async (account: any) => {
    setLoginLoading(true);
    setError(null);
    try {
      const authenticated = await client.login({
        accountOwner: {
          account: account.address,
          app: APP_ID,
          owner: address,
        },
        signMessage: (message: string) => signMessageAsync({ message }),
      });
      if (authenticated.isErr()) {
        setError(authenticated.error?.message || "Login failed");
        logout();
        return;
      }
      login(authenticated.value);
      // Save account to localStorage
      localStorage.setItem("selectedAccount", JSON.stringify(account));
      localStorage.setItem("smartAccountAddress", account.address);
      // Optionally: navigate or update global session context here
    } catch (err: any) {
      setError(err.message || "Login failed");
      logout();
    } finally {
      setLoginLoading(false);
      setSelectedAccount(account);
    }
  };

  // Logout handler to clear session
  const handleLogout = () => {
    logout();
    setSelectedAccount(null);
    setError(null);
    // Clear localStorage data
    localStorage.removeItem("selectedAccount");
    localStorage.removeItem("smartAccountAddress");
  };

  const shown = ["familyAccountsProvider", "injected"]
    .map((id) => connectors.find((c) => c.id === id))
    .filter(Boolean);

  if (active) {
    // If user is authenticated via Lens, show logout UI
    if (isAuthorized) {
      return (
        <div className="flex flex-col items-center space-y-2 w-full">
          <div className="text-green-600 text-sm">
            Logged in as{" "}
            {selectedAccount?.username?.value.replace(/^lens\//, "")} (
            {selectedAccount?.address})
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center text-sm underline text-blue-600 hover:text-blue-800"
          >
            <KeyIcon className="w-4 h-4 mr-1" />
            Change wallet
          </button>
          {loadingAccounts && (
            <div className="mt-4 text-gray-500 text-sm">
              Loading accounts...
            </div>
          )}
          {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
          {sessionClient && (
            <div className="mt-4 text-green-600 text-sm">Login successful!</div>
          )}
          {!loadingAccounts && accounts.length > 0 && (
            <div className="mt-4 w-full">
              <div className="mb-2 text-gray-800 font-semibold text-center">
                Select an account to sign in:
              </div>
              <ul className="space-y-2">
                {accounts.map((acc) => (
                  <li key={acc.id}>
                    <div
                      onClick={() => setSelectedAccount(acc)}
                      className={`w-full flex items-center px-4 py-2 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 ${
                        selectedAccount && selectedAccount.id === acc.id
                          ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                          : "border-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-3 w-full justify-start">
                        {acc.image && (
                          <img
                            src={acc.image}
                            alt={acc.username?.value?.replace(/^lens\//, "")}
                            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                          />
                        )}
                        <span className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {acc.username?.value?.replace(/^lens\//, "")}
                          </span>
                          <span className="text-xs text-gray-400 truncate">
                            ({acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                            )
                          </span>
                        </span>
                      </span>
                      {selectedAccount && selectedAccount.id === acc.id && (
                        <button
                          type="button"
                          className="ml-2 text-blue-600 font-bold flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogin(acc);
                          }}
                          disabled={loginLoading}
                        >
                          {loginLoading ? (
                            <Spinner />
                          ) : (
                            <IconlyArrowRightCircle size={30} color="#2563eb" />
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!loadingAccounts && accounts.length === 0 && (
            <div className="mt-4 text-gray-500 text-sm">
              No accounts found for this wallet.
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-2 w-full">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
          <span className="mr-2 text-black">Connected:</span>
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Unknown"}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center text-sm underline text-blue-600 hover:text-blue-800"
        >
          <KeyIcon className="w-4 h-4 mr-1" />
          Change wallet
        </button>
        {loadingAccounts && (
          <div className="mt-4 text-gray-500 text-sm">Loading accounts...</div>
        )}
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        {sessionClient && (
          <div className="mt-4 text-green-600 text-sm">Login successful!</div>
        )}
        {!loadingAccounts && accounts.length > 0 && (
          <div className="mt-4 w-full">
            <div className="mb-2 text-gray-800 font-semibold text-center">
              Select an account to sign in:
            </div>
            <ul className="space-y-2">
              {accounts.map((acc) => (
                <li key={acc.id}>
                  <div
                    onClick={() => setSelectedAccount(acc)}
                    className={`w-full flex items-center px-4 py-2 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 ${
                      selectedAccount && selectedAccount.id === acc.id
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                        : "border-gray-200 dark:border-gray-600 dark:bg-gray-800"
                    }`}
                  >
                    <span className="flex items-center gap-3 w-full justify-start">
                      {acc.image && (
                        <img
                          src={acc.image}
                          alt={acc.username?.value?.replace(/^lens\//, "")}
                          className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                        />
                      )}
                      <span className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {acc.username?.value?.replace(/^lens\//, "")}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          ({acc.address.slice(0, 6)}...{acc.address.slice(-4)})
                        </span>
                      </span>
                    </span>
                    {selectedAccount && selectedAccount.id === acc.id && (
                      <button
                        type="button"
                        className="ml-2 text-blue-600 font-bold flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogin(acc);
                        }}
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <Spinner />
                        ) : (
                          <IconlyArrowRightCircle size={30} color="#2563eb" />
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <a
                href="/register"
                className="mb-4 w-full inline-block justify-center text-center py-2 px-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                + Create Account
              </a>
            </div>
          </div>
        )}
        {!loadingAccounts && accounts.length === 0 && (
          <div className="mt-4 text-gray-500 text-sm">
            No accounts found for this wallet.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {shown
        .filter((c) => c!.id === "familyAccountsProvider")
        .map((c) => (
          <button
            key={c!.id}
            disabled={isPending}
            onClick={() => connectAsync({ connector: c! })}
            className="w-full flex items-center justify-between border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-xl px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <span>{WALLET_META[c!.id as keyof typeof WALLET_META].label}</span>
            <img
              src={WALLET_META[c!.id as keyof typeof WALLET_META].logo}
              alt={WALLET_META[c!.id as keyof typeof WALLET_META].label}
              onError={(e) => {
                e.currentTarget.src = "/path/to/default-icon.png";
              }}
              style={{ width: 32, height: 32 }}
            />
          </button>
        ))}

      <div className="flex items-center my-2">
        <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
        <span className="mx-2 text-gray-400 dark:text-gray-500 text-md font-medium select-none">
          or
        </span>
        <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="flex justify-center">
        <ConnectKitButton />
      </div>
    </div>
  );
}
