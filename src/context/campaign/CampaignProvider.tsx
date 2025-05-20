import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
import { fetchLensProfileByAddress, storageClient } from "@/lib/lens";
import type {
  CampaignGroupData,
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
  const [isLoading, setIsLoading] = useState(false);
  const [ownerProfiles, setOwnerProfiles] = useState<
    Record<string, TProfile | null>
  >({});
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);

  const fetchMetadata = async (uri: string): Promise<any> => {
    try {
      let url = uri;
      if (uri.startsWith("lens://")) {
        url = storageClient.resolve(uri);
      }
      const res = await fetch(url);
      return res.ok ? await res.json() : {};
    } catch (err) {
      console.error("Failed to fetch metadata:", uri, err);
      return {};
    }
  };

  const fetchCampaignGroups = useCallback(async () => {
    const now = Date.now();
    if (
      lastFetchTimeRef.current &&
      now - lastFetchTimeRef.current < 30000 &&
      !initialLoadRef.current
    ) {
      console.log(
        `Skipped fetch: last fetch was ${Math.round(
          (now - lastFetchTimeRef.current) / 1000
        )}s ago`
      );
      return;
    }

    try {
      setIsLoading(true);
      const totalGroups = Number(await getCampaignGroupCount());
      if (!totalGroups) {
        setCampaignGroups([]);
        setError(null);
        return;
      }

      const groupIds = Array.from(
        { length: totalGroups },
        (_, i) => totalGroups - i
      );
      const groupsData: CampaignGroupData[] = [];

      for (const groupId of groupIds) {
        const groupData = (await getCampaignGroup(
          groupId
        )) as CampaignGroupContract;
        if (!groupData) continue;

        const groupMetadata = groupData.groupURI
          ? await fetchMetadata(groupData.groupURI)
          : {};

        const campaignIds = (await getGroupPosts(groupId)) as bigint[];

        const campaigns: any = await Promise.all(
          campaignIds.map(async (campaignId) => {
            try {
              const campaign = (await getCampaign(
                Number(campaignId)
              )) as CampaignContract;
              if (!campaign) return null;

              const metadata = campaign.groveContentURI
                ? await fetchMetadata(campaign.groveContentURI)
                : {};

              return {
                id: Number(campaignId),
                postId: campaign.postId,
                sellerAddress: campaign.sellerAddress,
                amountPool: campaign.amountPool,
                rewardAmount: campaign.rewardAmount,
                actionType: campaign.actionType,
                minFollowersRequired: campaign.minFollowersRequired,
                availableSlots: campaign.availableSlots,
                claimedSlots: campaign.claimedSlots,
                adDisplayTimePeriod: campaign.adDisplayTimePeriod,
                groveContentURI: campaign.groveContentURI,
                contentHash: campaign.contentHash,
                status: campaign.status,
                metadata,
              };
            } catch (err) {
              console.error(`Failed to fetch campaign ${campaignId}`, err);
              return null;
            }
          })
        );

        groupsData.push({
          id: groupId,
          uri: groupData.groupURI,
          owner: groupData.owner,
          metadata: groupMetadata,
          campaigns,
        });
      }

      setCampaignGroups(groupsData);
      setIsLoading(false);
      setError(null);
      lastFetchTimeRef.current = now;
      initialLoadRef.current = false;
      console.log(`Fetched ${groupsData.length} campaign groups`);
    } catch (err: any) {
      console.error("Error fetching campaign groups:", err);
      setError(err.message || "Failed to load campaign groups");
    }
  }, [getCampaignGroup, getCampaign, getGroupPosts, getCampaignGroupCount]);

  useEffect(() => {
    if (initialLoadRef.current || !lastFetchTimeRef.current) {
      fetchCampaignGroups();
    }

    const interval = setInterval(() => {
      console.log("Polling campaign groups...");
      fetchCampaignGroups();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCampaignGroups]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const toFetch = campaignGroups.filter(
        (group) => !ownerProfiles[group.owner]
      );
      if (toFetch.length === 0) return;

      const newProfiles: Record<string, TProfile | null> = {};
      for (const group of toFetch) {
        try {
          const profile = await fetchLensProfileByAddress(group.owner);
          newProfiles[group.owner] = profile;
        } catch (e) {
          console.error(`Error fetching profile for ${group.owner}`, e);
          newProfiles[group.owner] = null;
        }
      }
      setOwnerProfiles((prev) => ({ ...prev, ...newProfiles }));
    };

    fetchProfiles();
  }, [campaignGroups, ownerProfiles]);

  // const isLoading =
  //   !ownerProfiles ||
  //   Object.keys(ownerProfiles).length === 0 ||
  //   campaignGroups.length === 0;

  return (
    <CampaignContext.Provider
      value={{
        campaignGroups,
        isLoading,
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
