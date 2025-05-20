import { useNavigate } from "react-router-dom";

const CampaignCard = ({
  group,
  ownerProfiles,
}: {
  group: any;
  ownerProfiles: { [key: string]: any };
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <div
        key={group.id}
        className=" bg-white h-64 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out"
        onClick={() =>
          navigate(`/campaign-group/${group.id}`, {
            state: { campaignGroup: group },
          })
        }
      >
        {/* Cover Photo Section */}
        <div className="relative z-3 h-28 md:h-32 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800">
          {group.metadata?.coverPhoto ? (
            <img
              src={group.metadata.coverPhoto}
              alt={group.metadata.name || "Cover photo"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                No Cover
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start">
            {/* Main Profile Picture - Overlapping and on the left */}
            <div className="relative -mt-12 z-10 flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700">
                {group.metadata?.profilePhoto ? (
                  <img
                    src={group.metadata.profilePhoto}
                    alt={group.metadata.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                    <span className="text-xs text-white">No Pic</span>
                  </div>
                )}
              </div>
            </div>

            {/* Text Content - To the right of the main profile picture */}
            <div className="ml-4 flex-grow min-w-0">
              <div className="text-xl font-semibold">
                {group.metadata?.name}
              </div>
              <div className="flex gap-2 items-center">
                {Object.keys(ownerProfiles[group.owner] ?? {})?.includes(
                  "image"
                ) ? (
                  <>
                    <img
                      className="w-5 h-5 rounded-full"
                      src={ownerProfiles[group.owner]?.image || ""}
                      alt={ownerProfiles[group.owner]?.name || "Owner"}
                    />
                    <span className="text-gray-700 dark:text-gray-300 inline-block max-w-[100px] align-bottom truncate">
                      {ownerProfiles[group.owner] !== undefined
                        ? ownerProfiles[group.owner]?.name || group.owner
                        : group.owner
                        ? group.owner.substring(0, 6) + "..."
                        : "N/A"}
                    </span>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="w-5 h-5 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shimmer mr-3"></div>
                        <div className="h-4 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded w-32 shimmer"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-left max-h-20 overflow-hidden text-ellipsis">
                {group.metadata?.description || "No description available."}
              </p>

              {/* Campaign Stats and Owner Info */}
              <div className="mt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-4 mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
                      />
                    </svg>
                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                      {group.campaigns?.length || 0}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
