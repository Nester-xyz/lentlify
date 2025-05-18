import { PublicClient, staging, testnet } from "@lens-protocol/client";
import { StorageClient, immutable } from "@lens-chain/storage-client";
import { fetchAccount } from "@lens-protocol/client/actions";

export const client = PublicClient.create({
  environment: testnet,

  storage: window.localStorage,
});

export const storageClient = StorageClient.create();
export { immutable };

export async function fetchLensProfileByAddress(address: string) {
  try {
    const result = await fetchAccount(client, { address });
    if (result.isErr()) {
      console.error("Failed to fetch Lens profile:", result.error);
      return null;
    }
    const account = result.value;
    if (!account) return null;
    return {
      address,
      name: account.username?.localName || "",
      image: account.metadata?.picture,
      bio: account.metadata?.bio || "",
      coverPicture: account.metadata?.coverPicture,
      createdAt: account.createdAt,
    };
  } catch (error) {
    console.error("Error fetching Lens profile:", error);
    return null;
  }
}
