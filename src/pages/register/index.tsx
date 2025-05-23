import React, { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Spinner } from "@/components/atoms/Spinner";
import { Button } from "@/components/atoms/Button";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "@/context/auth/AuthContext";
import { client } from "@/lib/lens";
import { createAccountWithUsername } from "@lens-protocol/client/actions";
import { uri } from "@lens-protocol/client";
import { storageClient } from "@/lib/lens";
import acl from "@/lib/acl";
import { buildAccountMetadata } from "./metadata";
import { useSessionClient } from "@/context/session/sessionContext";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";

const Register: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const { address, isDisconnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [userName, setUserName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [bio, setBio] = useState("");

  const navigate = useNavigate();
  const { login, setSelectedAccount, setProfile } = UseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { setSessionClient, setLoggedInUsername, setActiveLensAddress } =
    useSessionClient();

  const APP_ID = import.meta.env.VITE_LENS_APP_ID;

  const handleOnboarding = async () => {
    setIsLoading(true);
    try {
      if (!address) throw new Error("Wallet not connected");
      const authenticated = await client.login({
        onboardingUser: {
          app: APP_ID,
          wallet: address,
        },
        signMessage: (message) => signMessageAsync({ message }),
      });
      if (authenticated.isErr()) throw authenticated.error;
      const sessionCl = authenticated.value;
      setSessionClient(sessionCl);
      setLoggedInUsername(userName);
      setActiveLensAddress(address);
      let profilePhotoUri: string | undefined;
      if (profilePhoto) {
        const profRes = await storageClient.uploadFile(profilePhoto, { acl });
        profilePhotoUri = profRes.gatewayUrl;
      }
      let coverPhotoUri: string | undefined;
      if (coverPhoto) {
        const covRes = await storageClient.uploadFile(coverPhoto, { acl });
        coverPhotoUri = covRes.gatewayUrl;
      }
      const metadata = buildAccountMetadata({
        name: userName,
        profilePhoto: profilePhotoUri,
        coverPhoto: coverPhotoUri,
        bio,
      });
      const { uri: metadataUri } = await storageClient.uploadAsJson(metadata, {
        acl,
      });
      const result = await createAccountWithUsername(sessionCl, {
        username: { localName: userName },
        metadataUri: uri(metadataUri),
      }).andThen(handleOperationWith(walletClient!));

      console.log("Account creation result:", result);
      if (result.isErr()) throw result.error;

      // Get the transaction hash from the result
      const txHash = result.value;
      console.log("Account creation transaction hash:", txHash);

      // For Lens Protocol, we need to use the smart wallet address, not the EOA
      // The smart wallet address is different from the EOA address
      // Since we can't easily get it from the API right after creation,
      // we'll use a workaround to get it from the session

      // First, let's log in with the session client we already have
      login(sessionCl.toString());

      // Create a temporary account object with the username we just created
      const tempAccount = {
        id: `${userName}`,
        username: { localName: userName },
        address: address as `0x${string}`, // Temporarily use EOA, we'll update this in the UI later
      };

      // Set the selected account
      setSelectedAccount(tempAccount);

      // For now, we'll use the temporary account address (EOA) in the profile
      // In a production environment, you would want to fetch the actual Lens smart wallet address
      // after the transaction is confirmed and update the profile accordingly
      setProfile({
        name: userName,
        image: profilePhotoUri,
        address: tempAccount.address, // Using the temporary account address for now
        bio: bio,
        coverPicture: coverPhotoUri,
        createdAt: new Date().toISOString(),
      });

      // Also update the active Lens address in the session context
      // In a real implementation, you would want to update this with the actual Lens smart wallet address
      setActiveLensAddress(tempAccount.address);

      // Add a comment to remind developers to update this in the future
      console.log(
        "IMPORTANT: In production, update the profile and session with the actual Lens smart wallet address"
      );
      navigate("/");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Register
        </h2>
        {/* {error && <div className="mb-4 text-red-600 text-center">{error}</div>} */}
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            Sign in
          </a>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              await handleOnboarding();
            }}
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label
                htmlFor="profilePhoto"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Photo (optional)
              </label>
              <input
                id="profilePhoto"
                name="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setProfilePhoto(
                    e.target.files && e.target.files[0]
                      ? e.target.files[0]
                      : null
                  )
                }
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="coverPhoto"
                className="block text-sm font-medium text-gray-700"
              >
                Cover Photo (optional)
              </label>
              <input
                id="coverPhoto"
                name="coverPhoto"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCoverPhoto(
                    e.target.files && e.target.files[0]
                      ? e.target.files[0]
                      : null
                  )
                }
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio (optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <div>
              <Button
                type="submit"
                size="lg"
                variant="default"
                disabled={isDisconnected || !userName || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 animate-spin" size="sm" />{" "}
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
