import Post from "@/components/molecules/Post";
import CircularCard from "@/components/atoms/CircularCard";
import CampaignHeader from "@/components/molecules/CampaignHeader";

const Campaign = () => {
  const campaignData = {
    id: 1,
    campaignName: "Summer Vibes 2025",
    description:
      "Join the Summer Vibes campaign and show off your sun-kissed moments with our exclusive products and challenges. From beach activities to tropical escapes, spread the warmth with your summer story!",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    coverPicture:
      "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:ytvestxik66jck5inu464bjs/bafkreibffnpnoatd64gwa46nm4qh44m3z264b6dqia2gnvlbvgfpgonp6i@jpeg",
    creator: {
      name: "BeachLife Co.",
      username: "@beachlifeofficial",
      profilePic:
        "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:ytvestxik66jck5inu464bjs/bafkreibffnpnoatd64gwa46nm4qh44m3z264b6dqia2gnvlbvgfpgonp6i@jpeg",
    },
    location: "Global",
    categories: ["Fashion", "Lifestyle", "Travel", "Sports", "Beauty"],
    targetAudience: {
      ageRange: "18-35",
      gender: "All",
      interests: ["Beachwear", "Travel", "Fitness", "Cosmetics", "Photography"],
    },
    goals: [
      { goal: "Increase brand awareness", target: 1000000, current: 450000 },
      {
        goal: "Engage with 500k users on social media",
        target: 500000,
        current: 210000,
      },
      { goal: "Promote 50k products", target: 50000, current: 17500 },
    ],
    influencers: [
      {
        name: "Jessica Smith",
        handle: "@jessica_beachy",
        followerCount: 1500000,
        engagementRate: 3.2,
        posts: [
          { postID: 1, date: "2025-06-06", likes: 25000, comments: 1200 },
          { postID: 2, date: "2025-06-10", likes: 30000, comments: 1500 },
        ],
      },
      {
        name: "Tom Beach",
        handle: "@tom_beachmode",
        followerCount: 2500000,
        engagementRate: 5.0,
        posts: [
          { postID: 1, date: "2025-06-07", likes: 35000, comments: 1700 },
          { postID: 2, date: "2025-06-12", likes: 40000, comments: 2000 },
        ],
      },
    ],
    mediaAssets: [
      {
        type: "Image",
        url: "https://example.com/image1.jpg",
        description: "A beautiful sunset at the beach with our new swimwear.",
      },
      {
        type: "Video",
        url: "https://example.com/video1.mp4",
        description:
          "Catch a glimpse of our exclusive beach collection in action.",
      },
    ],
    engagementMetrics: {
      totalImpressions: 50000000,
      totalClicks: 3200000,
      totalShares: 1200000,
      averageEngagementRate: 4.6,
    },
    contentSchedule: [
      {
        date: "2025-06-01",
        contentType: "Instagram Post",
        description: "Launch post to introduce the campaign.",
      },
      {
        date: "2025-06-07",
        contentType: "Instagram Story",
        description: "Influencers share first impressions of the campaign.",
      },
      {
        date: "2025-06-14",
        contentType: "Live Stream",
        description: "Live workout challenge by influencers.",
      },
      {
        date: "2025-06-21",
        contentType: "Blog Post",
        description: "How to make the most of your summer with the campaign.",
      },
    ],
    trending: true,
  };

  return (
    <CircularCard>
      <div className="mx-auto rounded-xl overflow-hidden ">
        {/* Influencers Section */}
        <CampaignHeader
          campaignData={{
            campaignName: campaignData.campaignName,
            description: campaignData.description,
            startDate: campaignData.startDate,
            endDate: campaignData.endDate,
            coverPicture: campaignData.creator.profilePic,
            creator: campaignData.creator,
          }}
        />

        {/* Post */}
        <h2 className="text-xl font-semibold mb-2">Original Post</h2>
        <CircularCard>
          <Post />
        </CircularCard>

        <div className="mb-8 mt-5">
          <h2 className="text-xl font-semibold mb-2">Engagement Metrics</h2>
          <div className="space-y-2">
            <p>
              Total Impressions:{" "}
              {campaignData.engagementMetrics.totalImpressions}
            </p>
            <p>Total Clicks: {campaignData.engagementMetrics.totalClicks}</p>
            <p>Total Shares: {campaignData.engagementMetrics.totalShares}</p>
            <p>
              Average Engagement Rate:{" "}
              {campaignData.engagementMetrics.averageEngagementRate}%
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Influencers</h2>
          <CircularCard>
            {campaignData.influencers.map((_, index) => (
              <div key={index} className="mb-4 rounded-lg">
                <div className="mt-4">
                  <Post />
                </div>
              </div>
            ))}
          </CircularCard>
        </div>
      </div>
    </CircularCard>
  );
};

export default Campaign;
