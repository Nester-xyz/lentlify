import { StorageClient, production } from "@lens-chain/storage-client";

export const storageClient = StorageClient.create(production);
