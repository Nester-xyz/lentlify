import React, { useState, useEffect } from "react";
import { useOutletContext, useParams, useLocation } from "react-router-dom";
import CreatePost from "@/components/molecules/createPost";
import { fetchAccount } from "@lens-protocol/client/actions";
import { client, storageClient } from "@/lib/lens";
import CircularCard from "@/components/atoms/CircularCard";
import CampaignHeader from "@/components/molecules/CampaignHeader";
import Post from "@/components/molecules/Post";

interface CampaignMetadata {
  name: string;
  description: string;
  coverPhoto?: string;
  profilePhoto?: string;
  campaignIds: string[];
  owner?: string;
  createdAt?: string;
}

interface Profile {
  name: string;
  address: string;
  image?: string;
  bio: string;
  coverPicture?: string;
  createdAt: string;
}

const Campaign: React.FC = () => {
  const profile = useOutletContext<Profile | null>();
  const { campaignId } = useParams<{ campaignId: string }>();
  const location = useLocation();
  const navState = location.state as { metaUri: string } | undefined;
  let metaUri = navState?.metaUri;
  if (!metaUri) {
    const stored = localStorage.getItem(`campaign_${campaignId}`);
    if (stored) metaUri = JSON.parse(stored).metaUri;
  }
  // Debug: Log metaUri
  console.log("metaUri:", metaUri);

  const [metaData, setMetaData] = useState<CampaignMetadata | null>(null);
  useEffect(() => {
    if (!metaUri) return;
    const fetchMeta = async () => {
      // Debug: Fetching metadata
      console.log("Fetching metadata from:", metaUri);

      try {
        // resolve lens:// URI or storage key to Grove gateway URL
        const uri = storageClient.resolve(metaUri);
        console.log(uri);
        const res = await fetch(uri);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setMetaData(json as CampaignMetadata);
        // Debug: Log fetched metaData
        console.log("Fetched metaData:", json);
      } catch (e) {
        console.error("Failed to fetch campaign metadata:", e);
      }
    };
    fetchMeta();
  }, [metaUri]);

  const [ownerProfile, setOwnerProfile] = useState<{
    name: string;
    picture?: string;
  } | null>(null);
  useEffect(() => {
    // Debug: Log metaData.owner
    console.log("metaData.owner:", metaData?.owner);
    const owner = metaData?.owner;

    if (!owner) return;
    (async () => {
      const res = await fetchAccount(client, { address: owner });
      if (res.isErr()) {
        console.error("Failed to fetch owner:", res.error);
        return;
      }
      const acc = res.value;
      if (!acc) {
        console.error("Owner account not found");
        return;
      }
      const name = acc.username?.localName || acc.metadata?.name || owner;
      setOwnerProfile({ name, picture: acc.metadata?.picture });
      // Debug: Log ownerProfile
      console.log("ownerProfile:", { name, picture: acc.metadata?.picture });
    })();
  }, [metaData?.owner]);

  const ads = [1, 2, 3];

  return (
    <div className="max-w-2xl mx-auto py-6">
      {metaData ? (
        <CircularCard>
          <div className="mx-auto rounded-xl overflow-hidden">
            <CampaignHeader
              campaignData={{
                campaignName: metaData.name,
                description: metaData.description,
                createdAt: metaData.createdAt,
                startDate: "",
                endDate: "",
                coverPicture: metaData.coverPhoto || "",
                creator: {
                  name: ownerProfile?.name,
                  username: `@${ownerProfile?.name}`,
                  profilePic: metaData.profilePhoto || "",
                },
              }}
            />

            {profile && <CreatePost profile={profile} />}
            <CircularCard>
              <Post />
            </CircularCard>

            <div className="mb-8 mt-5">
              <h2 className="text-xl font-semibold mb-2 dark:text-white">
                Engagement Metrics
              </h2>
              <div className="space-y-2 dark:text-gray-300">
                <p>Total Impressions: 100000</p>
                <p>Total Clicks: 5000</p>
                <p>Total Shares: 200</p>
                <p>Average Engagement Rate: 4.6%</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                Influencers
              </h2>
              <CircularCard>
                {[1, 2].map((_, i) => (
                  <div key={i} className="mb-4 rounded-lg">
                    <div className="mt-4">
                      <Post />
                    </div>
                  </div>
                ))}
              </CircularCard>
            </div>
          </div>
        </CircularCard>
      ) : (
        <h1 className="text-2xl font-bold mb-2 dark:text-white">
          Loading campaign...
        </h1>
      )}
      <div className="border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden mt-6">
        {ads.map((item, index) => (
          <div key={item}>
            <Post />
            {index < ads.length - 1 && (
              <hr className="border-t border-gray-200 dark:border-gray-700 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campaign;
