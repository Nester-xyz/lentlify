import { PublicClient, testnet } from "@lens-protocol/client";
import { StorageClient, immutable } from "@lens-chain/storage-client";

export const client = PublicClient.create({
  environment: testnet,

  storage: window.localStorage,
});

export const storageClient = StorageClient.create();
export { immutable };
