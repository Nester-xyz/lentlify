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
  const { login, setSelectedAccount } = UseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { setSessionClient, setLoggedInUsername, setActiveLensAddress } =
    useSessionClient();

  const handleOnboarding = async () => {
    setIsLoading(true);
    try {
      if (!address) throw new Error("Wallet not connected");
      const authenticated = await client.login({
        onboardingUser: {
          app: "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7",
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

      console.log(result);
      if (result.isErr()) throw result.error;
      login(sessionCl.toString());
      setSelectedAccount(result.value);
      navigate("/");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register
        </h2>
        {/* {error && <div className="mb-4 text-red-600 text-center">{error}</div>} */}
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </a>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
