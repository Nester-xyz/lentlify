import type { TCampaignHeader } from "@/types/Campaign";

type Props = {
  campaignData: TCampaignHeader;
};

const CampaignHeader = ({ campaignData }: Props) => {
  console.log(campaignData.creator);
  return (
    <>
      <div
        className="relative h-48 bg-gray-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${campaignData.coverPicture})` }}
      >
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
              {campaignData.creator.profilePic ? (
                <img
                  src={campaignData.creator.profilePic}
                  alt={campaignData.creator.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xl text-gray-500">
                  {campaignData.creator.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* <div className="absolute -bottom-16 right-5 bg-white">
          <button
            className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
            onClick={() => alert("Join Campaign")}
          >
            Join
          </button>
        </div> */}
      </div>

      {/* Campaign Header */}

      <div className="pt-20 text-center flex flex-col justify-center w-full pb-1">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {campaignData.campaignName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Created by {campaignData.creator.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Created at{" "}
          {campaignData.createdAt
            ? new Date(campaignData.createdAt).toLocaleDateString()
            : "-"}
        </p>

        {/* Bio */}
        <div className="mb-2 mt-4 text-left line-clamp-3">
          <p className="text-gray-700 dark:text-gray-200">
            {campaignData.description}
          </p>
        </div>
      </div>
    </>
  );
};

export default CampaignHeader;
