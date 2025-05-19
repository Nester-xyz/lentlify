import React, { useState, useEffect, useRef } from "react";
import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
import { useAccount } from "wagmi";
import { storageClient } from "@/lib/lens";

interface CampaignGroupSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

interface CampaignGroup {
  id: number;
  name: string;
  uri: string;
}

const CampaignGroupSelector: React.FC<CampaignGroupSelectorProps> = ({
  value,
  onChange,
}) => {
  const [groups, setGroups] = useState<CampaignGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);
  
  const { address } = useAccount();
  const { getCampaignGroup, getSellerCampaignGroups } = useLensAdCampaignMarketplace();

  useEffect(() => {
    const fetchCampaignGroups = async () => {
      // Skip if we've already fetched or if address is missing
      if (initialFetchDone.current || !address) {
        if (!address) {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        
        // Get all group IDs for the current user
        const groupIds = (await getSellerCampaignGroups(
          address
        )) as unknown as bigint[];
        
        if (!groupIds || groupIds.length === 0) {
          setGroups([]);
          setIsLoading(false);
          initialFetchDone.current = true;
          return;
        }

        const fetchedGroups: CampaignGroup[] = [];

        // Fetch data for each group
        for (const groupId of groupIds) {
          const groupData = (await getCampaignGroup(
            Number(groupId)
          )) as any;

          if (groupData) {
            let name = `Group #${Number(groupId)}`;
            
            // Fetch metadata from Grove storage if URI exists
            if (groupData.groupURI) {
              try {
                let fetchUrl = groupData.groupURI;

                // If it's a lens:// URL, use storageClient to resolve it
                if (fetchUrl.startsWith("lens://")) {
                  try {
                    fetchUrl = storageClient.resolve(fetchUrl);
                    
                    // Fetch metadata from the resolved URL
                    const metadataResponse = await fetch(fetchUrl);
                    if (metadataResponse.ok) {
                      const metadata = await metadataResponse.json();
                      if (metadata && metadata.name) {
                        name = metadata.name;
                      }
                    }
                  } catch (err) {
                    console.error(
                      `Error fetching metadata for group ${groupId}:`,
                      err
                    );
                  }
                }
              } catch (err) {
                console.error(
                  `Error processing group ${groupId}:`,
                  err
                );
              }
            }

            fetchedGroups.push({
              id: Number(groupId),
              name,
              uri: groupData.groupURI,
            });
          }
        }

        setGroups(fetchedGroups);
        // Mark that we've completed the initial fetch
        initialFetchDone.current = true;
      } catch (err: any) {
        console.error("Error fetching campaign groups:", err);
        setError(err.message || "Failed to load campaign groups");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignGroups();
  }, [address, getCampaignGroup, getSellerCampaignGroups]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Campaign Group
      </label>
      <div className="relative">
        <select
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="0">Select Group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id.toString()}>
              {group.id} - {group.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute right-10 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
          </div>
        )}
        <div className="absolute right-3 top-2 text-gray-500 cursor-help group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Select a campaign group to add this campaign to, or select
            "No Group" to create a standalone campaign.
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default CampaignGroupSelector;
