import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAccount } from "wagmi";

import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
import { storageClient } from "@/lib/lens";
import type {
  CampaignGroupData,
  CampaignData,
  CampaignContract,
  CampaignGroupContract,
} from "@/types/campaign";
import { UseAuth } from "@/context/auth/AuthContext";

interface CampaignContextType {
  campaignGroups: CampaignGroupData[];
  isLoading: boolean;
  error: string | null;
  fetchCampaignGroups: () => Promise<void>;
  lastFetchTime: number | null;
}

const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined
);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { profile } = UseAuth();
  const { address } = useAccount();
  const {
    getCampaignGroup,
    getCampaign,
    getGroupPosts,
    getCampaignGroupCount,
    CONTRACT_ADDRESS,
  } = useLensAdCampaignMarketplace();

  const [campaignGroups, setCampaignGroups] = useState<CampaignGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);

  // Add a fetching flag to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);
  
  const fetchCampaignGroups = useCallback(async () => {
    // Skip if already fetching
    if (isFetchingRef.current) {
      return;
    }
    
    // Skip if no wallet address or profile
    if (!address || !profile) {
      if (initialLoadRef.current) setIsLoading(false);
      return;
    }

    // Only log wallet and contract info on initial load
    if (initialLoadRef.current) {
      console.log("CampaignContext: Initial load with wallet", address.slice(0, 6) + "...");
    }

    const now = Date.now();
    // Throttle fetches to prevent spamming
    if (
      lastFetchTimeRef.current &&
      now - lastFetchTimeRef.current < 60000 && // Increased to 60 seconds
      !initialLoadRef.current
    ) {
      // No need to log this every time
      if (campaignGroups.length > 0) {
        setIsLoading(false);
      }
      return;
    }

    // Set fetching flag to true
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const totalGroups = await getCampaignGroupCount();
      
      // Only log on initial load or when the count changes
      if (initialLoadRef.current) {
        console.log(`CampaignContext: Total campaign groups: ${totalGroups}`);
      }

      if (!totalGroups || Number(totalGroups) === 0) {
        // Only log on initial load
        if (initialLoadRef.current) {
          console.log("CampaignContext: No campaign groups found");
        }
        setCampaignGroups([]);
        setError(null);
        isFetchingRef.current = false; // Reset fetching flag
        return;
      }

      const startId = Number(totalGroups);
      const groupIds: number[] = [];
      for (let i = startId; i >= 1; i--) {
        groupIds.push(i);
      }

      // Only log on initial load
      if (initialLoadRef.current) {
        console.log(`CampaignContext: Fetching ${groupIds.length} campaign groups`);
      }
      const groupsData: CampaignGroupData[] = [];

      for (const groupId of groupIds) {
        const groupData = (await getCampaignGroup(
          Number(groupId)
        )) as unknown as CampaignGroupContract;
        if (groupData) {
          let metadata: any = {};
          if (groupData.groupURI) {
            try {
              let fetchUrl = groupData.groupURI;
              if (fetchUrl.startsWith("lens://")) {
                const contentHash = fetchUrl.replace("lens://", "");
                try {
                  fetchUrl = storageClient.resolve(fetchUrl);
                } catch (resolveErr) {
                  console.error(
                    `CampaignContext: Error resolving lens URI for group ${Number(
                      groupId
                    )}:`,
                    resolveErr
                  );
                  metadata = {
                    name: `Campaign Group #${Number(groupId)}`,
                    description: `Campaign group with content hash: ${contentHash.substring(
                      0,
                      10
                    )}...`,
                  };
                  throw new Error("Failed to resolve lens URI");
                }
              }
              const metadataResponse = await fetch(fetchUrl);
              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
              }
            } catch (err) {
              console.error(
                `CampaignContext: Error fetching metadata for group ${groupId}:`,
                err
              );
            }
          }

          const campaignIds = (await getGroupPosts(
            Number(groupId)
          )) as unknown as bigint[];
          const campaigns: CampaignData[] = [];
          if (campaignIds && campaignIds.length > 0) {
            for (const campaignId of campaignIds) {
              const campaignDetails = (await getCampaign(
                Number(campaignId)
              )) as unknown as CampaignContract;
              if (campaignDetails) {
                let campaignMetadata: any = {};
                if (campaignDetails.groveContentURI) {
                  try {
                    const campaignMetadataResponse = await fetch(
                      campaignDetails.groveContentURI
                    );
                    if (campaignMetadataResponse.ok) {
                      campaignMetadata = await campaignMetadataResponse.json();
                    }
                  } catch (err) {
                    console.error(
                      `CampaignContext: Error fetching metadata for campaign ${campaignId}:`,
                      err
                    );
                  }
                }
                campaigns.push({
                  id: Number(campaignId),
                  postId: campaignDetails.postId,
                  sellerAddress: campaignDetails.sellerAddress,
                  amountPool: campaignDetails.amountPool,
                  rewardAmount: campaignDetails.rewardAmount,
                  actionType: campaignDetails.actionType,
                  minFollowersRequired: campaignDetails.minFollowersRequired,
                  availableSlots: campaignDetails.availableSlots,
                  claimedSlots: campaignDetails.claimedSlots,
                  adDisplayTimePeriod: campaignDetails.adDisplayTimePeriod,
                  groveContentURI: campaignDetails.groveContentURI,
                  contentHash: campaignDetails.contentHash,
                  status: campaignDetails.status,
                  metadata: campaignMetadata,
                });
              }
            }
          }
          groupsData.push({
            id: Number(groupId),
            uri: groupData.groupURI,
            owner: groupData.owner,
            metadata,
            campaigns,
          });
        }
      }
      setCampaignGroups(groupsData);
      setError(null);
      lastFetchTimeRef.current = Date.now();
      initialLoadRef.current = false;
      
      // Only log completion on initial load
      if (initialLoadRef.current) {
        console.log(`CampaignContext: Fetch completed - found ${groupsData.length} groups with data`);
      }
    } catch (err: any) {
      console.error("CampaignContext: Error fetching campaign groups:", err);
      setError(err.message || "Failed to load campaign groups");
    } finally {
      // Always reset the fetching flag and loading state
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [
    address,
    profile,
    getCampaignGroup,
    getCampaign,
    getGroupPosts,
    getCampaignGroupCount,
    CONTRACT_ADDRESS,
    campaignGroups.length,
  ]);

  useEffect(() => {
    // Only fetch on initial load or when dependencies change
    if (initialLoadRef.current || !lastFetchTimeRef.current) {
      fetchCampaignGroups();
    }
    
    // Set up polling with a longer interval to reduce spamming
    const pollingInterval = setInterval(() => {
      // Only log once per minute instead of every poll
      if (Date.now() % 60000 < 30000) {
        console.log("CampaignContext: Polling for campaign updates");
      }
      fetchCampaignGroups();
    }, 60000); // Increased from 30s to 60s

    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchCampaignGroups]);

  return (
    <CampaignContext.Provider
      value={{
        campaignGroups,
        isLoading,
        error,
        fetchCampaignGroups,
        lastFetchTime: lastFetchTimeRef.current,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error(
      "useCampaignContext must be used within a CampaignProvider"
    );
  }
  return context;
};
