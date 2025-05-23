import { useState } from "react";
import { Link } from "react-router-dom";

const SidebarRight = () => {
  const [search, setSearch] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const trendingItems = [
    "NFL Draft",
    "George Santos",
    "Judge Dugan",
    "Iran",
    "Whitecaps",
    "ActBlue",
  ];

  const defaultCampaigns = [
    { id: 1, name: "Summer Sale 2025", progress: 75 },
    { id: 2, name: "New Customer Acquisition", progress: 45 },
    { id: 3, name: "Product Launch: Alpha Series", progress: 25 },
    { id: 4, name: "Email Marketing - Spring", progress: 90 },
    { id: 5, name: "Social Media Contest", progress: 60 },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-1">
      <div className="flex items-center pb-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search"
          className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <div className="text-gray-800 dark:text-gray-200 font-semibold text-xl mb-4">
          Trending
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {trendingItems.map((item, index) => (
            <span
              key={index}
              className="px-4 py-1 border rounded-full text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>

        <div>
          <div className="text-gray-800 dark:text-gray-200 font-semibold text-xl mb-4">
            Campaign
          </div>

          <div className="space-y-2">
            {defaultCampaigns.map((campaign) => (
              <div key={campaign.id} className="">
                <Link to={`/campaign/${campaign.id}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
                      {campaign.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {campaign.progress}%
                    </span>
                  </div>

                  <div className="w-10/12 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-0.5 rounded-full"
                      style={{
                        width: `${campaign.progress}%`,
                        backgroundColor:
                          campaign.progress >= 75
                            ? "#4CAF50"
                            : campaign.progress >= 50
                            ? "#FF9800"
                            : "#F44336",
                      }}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-blue-600 dark:text-blue-400 mt-4">
          <a href="#" className="hover:underline">
            Privacy
          </a>{" "}
          •{" "}
          <a href="#" className="hover:underline">
            Terms
          </a>{" "}
          •{" "}
          <a href="#" className="hover:underline">
            Help
          </a>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
