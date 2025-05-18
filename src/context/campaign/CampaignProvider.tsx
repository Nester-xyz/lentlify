import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
import { fetchLensProfileByAddress, storageClient } from "@/lib/lens";
import type {
  CampaignGroupData,
  CampaignData,
  CampaignContract,
  CampaignGroupContract,
} from "@/types/campaign";
import { CampaignContext } from "./CampaignContext";
import type { TProfile } from "@/types/User";

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    getCampaignGroup,
    getCampaign,
    getGroupPosts,
    getCampaignGroupCount,
  } = useLensAdCampaignMarketplace();

  const [campaignGroups, setCampaignGroups] = useState<CampaignGroupData[]>([]);
  const [ownerProfiles, setOwnerProfiles] = useState<
    Record<string, TProfile | null>
  >({});
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);

  const fetchCampaignGroups = useCallback(async () => {
    const now = Date.now();
    if (
      lastFetchTimeRef.current &&
      now - lastFetchTimeRef.current < 30000 &&
      !initialLoadRef.current
    ) {
      console.log(
        `CampaignContext: Too soon to fetch again (${Math.round(
          (now - (lastFetchTimeRef.current || 0)) / 1000
        )}s since last fetch)`
      );
      return;
    }

    try {
      const totalGroups = await getCampaignGroupCount();
      console.log(`CampaignContext: Total campaign groups: ${totalGroups}`);

      if (!totalGroups || Number(totalGroups) === 0) {
        console.log("CampaignContext: No campaign groups found");
        setCampaignGroups([]);
        setError(null);
        return;
      }

      const startId = Number(totalGroups);
      const groupIds: number[] = [];
      for (let i = startId; i >= 1; i--) {
        groupIds.push(i);
      }

      console.log(
        `CampaignContext: Fetching ${groupIds.length} campaign groups`
      );
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
      console.log(
        `CampaignContext: Fetch completed - found ${groupsData.length} groups with data`
      );
    } catch (err: any) {
      console.error("CampaignContext: Error fetching campaign groups:", err);
      setError(err.message || "Failed to load campaign groups");
    }
  }, [getCampaignGroup, getCampaign, getGroupPosts, getCampaignGroupCount]);

  useEffect(() => {
    if (initialLoadRef.current || !lastFetchTimeRef.current) {
      fetchCampaignGroups();
    }
    const pollingInterval = setInterval(() => {
      console.log("CampaignContext: Polling for campaign updates");
      fetchCampaignGroups();
    }, 30000);

    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchCampaignGroups]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (campaignGroups.length > 0) {
        const profilesToFetch = campaignGroups.filter(
          (group) => !ownerProfiles[group.owner]
        );
        if (profilesToFetch.length === 0) {
          return;
        }

        const newProfiles: Record<string, TProfile | null> = {};
        for (const group of profilesToFetch) {
          if (group.owner && !ownerProfiles[group.owner]) {
            try {
              const profile = await fetchLensProfileByAddress(group.owner);
              newProfiles[group.owner] = profile;
            } catch (e) {
              console.error(`Failed to fetch profile for ${group.owner}`, e);
              newProfiles[group.owner] = null;
            }
          }
        }
        setOwnerProfiles((prevProfiles) => ({
          ...prevProfiles,
          ...newProfiles,
        }));
      }
    };

    fetchProfiles();
  }, [campaignGroups, ownerProfiles]);

  return (
    <CampaignContext.Provider
      value={{
        campaignGroups,
        isLoading: !(
          ownerProfiles &&
          Object.values(ownerProfiles).length > 0 &&
          Object.values(ownerProfiles)[0]?.name &&
          campaignGroups.length > 0
        ),
        error,
        fetchCampaignGroups,
        lastFetchTime: lastFetchTimeRef.current,
        profiles: ownerProfiles,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};
