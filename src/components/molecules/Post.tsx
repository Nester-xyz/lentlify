import React from "react";
import CircularAvatar from "../atoms/CircularAvatar";

const Post: React.FC = () => {
  const DUMMY_DATA = {
    id: "post-5",
    author: {
      id: "user-8",
      username: "danielr",
      displayName: "Daniel Rodriguez",
      avatarUrl: "/api/placeholder/40/40",
    },
    text: "Made my grandma's secret recipe pasta today. Family dinner success! #cooking #homemade",
    media: [
      {
        id: "media-5",
        url: "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:ytvestxik66jck5inu464bjs/bafkreibffnpnoatd64gwa46nm4qh44m3z264b6dqia2gnvlbvgfpgonp6i@jpeg",
        type: "image",
        alt: "Pasta dish",
      },
    ],
    hearts: 56,
    comments: [
      {
        id: "comment-4",
        author: {
          id: "user-9",
          username: "oliviac",
          displayName: "Olivia Clark",
          avatarUrl: "/api/placeholder/40/40",
        },
        content:
          "That looks delicious! Would love to get the recipe if it's not a secret anymore 😉",
        hearts: 4,
        createdAt: "2025-04-13T18:40:00Z",
      },
    ],
    shares: [],
    createdAt: "2025-04-13T17:25:00Z",
    tags: ["cooking", "homemade"],
  };

  return (
    <div className="bg-white dark:bg-gray-800 mb-4 overflow-hidden">
      <section className="flex justify-between items-center px-4 py-2">
        {/* User Info */}
        <div className="flex items-center gap-3 shrink-0">
          <CircularAvatar src={DUMMY_DATA.author.avatarUrl} alt={`avatar`} />
          <div>
            <h5 className="font-semibold dark:text-white">
              {DUMMY_DATA.author.displayName}
            </h5>
            <h6 className="text-sm text-gray-500 dark:text-gray-400">
              @{DUMMY_DATA.author.username}
            </h6>
          </div>
        </div>

        {/* Edit or Options Button */}
        <div>
          <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-150">
            ⋮
          </button>
        </div>
      </section>

      <div className="px-5 py-3 ">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-4 text-base">
          {DUMMY_DATA.text}
        </p>

        {/* images */}
        {DUMMY_DATA.media && DUMMY_DATA.media.length > 0 && (
          <div className="px-0 mb-2 rounded-2xl overflow-hidden">
            <img
              src={DUMMY_DATA.media[0].url}
              alt={DUMMY_DATA.media[0].alt}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {DUMMY_DATA.tags && DUMMY_DATA.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {DUMMY_DATA.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 cursor-pointer font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
