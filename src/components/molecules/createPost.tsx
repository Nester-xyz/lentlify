import React, { useState, useEffect } from "react";
import { postId } from "@lens-protocol/client";
import { fetchPost } from "@lens-protocol/client/actions";
import { client } from "@/lib/lens";

interface Profile {
  name: string;
  image?: string;
  address: string; //should bring profile address to pass for grove storage about the information on seller's address
  bio: string;
  coverPicture?: string;
  createdAt: string;
}

const CreatePost: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  // Step 1 fields
  const [link, setLink] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Like");
  // Step 2 fields
  const [minFollowers, setMinFollowers] = useState("");
  const [maxSlots, setMaxSlots] = useState("");
  const [duration, setDuration] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postPreview, setPostPreview] = useState<any>(null);

  useEffect(() => {
    if (step !== 1 || !link) {
      setPostPreview(null);
      setPostError(null);
      setLoadingPost(false);
      return;
    }
    const match = link.match(/\/posts\/([^\/\?#]+)/);
    if (!match) {
      setPostError("Invalid post URL");
      setPostPreview(null);
      return;
    }
    const id = match[1];
    setLoadingPost(true);
    (async () => {
      try {
        const result = await fetchPost(client, { post: postId(id) });
        console.log("fetchPost result:", result);
        if (result.isErr()) {
          setPostError(result.error.message);
          setPostPreview(null);
        } else {
          setPostPreview(result.value);
          setPostError(null);
        }
      } catch (err: any) {
        setPostError(err.message);
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [link, step]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-2 border border-gray-300 dark:border-gray-700 overflow-x-hidden">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-gray-600 dark:text-gray-300">
          {!isOpen
            ? "Want to create an advertisement?"
            : step === 1
            ? "Basic Information"
            : step === 2
            ? "Campaign Requirements"
            : "Quote Post Requirements"}
        </span>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 h-[17rem] flex flex-col justify-between">
          {step === 1 && (
            <div className="flex gap-6 items-start mb-4 flex-wrap">
              <div className="flex-1 min-w-0 space-y-8">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Post URL
                  </label>
                  <div className="flex items-center w-96 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
                    <input
                      type="text"
                      placeholder="Enter post URL"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button
                      type="button"
                      className="ml-2 bg-teal-400 text-white rounded-md py-1 px-3 text-xs font-light transition-colors duration-200 hover:bg-teal-500 focus:ring-2 focus:ring-teal-300 dark:focus:ring-teal-700"
                      onClick={async () => {
                        const text = await navigator.clipboard.readText();
                        setLink(text);
                      }}
                    >
                      Paste
                    </button>
                  </div>
                  {loadingPost && <div>Loading post preview...</div>}
                  {postError && <div className="text-red-500">{postError}</div>}
                </div>
                <div className="flex gap-10">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Pool Amount
                    </label>
                    <div className="flex items-center w-46 bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
                      <input
                        type="number"
                        min={1}
                        placeholder="Enter pool amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm py-1 placeholder-gray-400 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <div className="flex items-center w-40 bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm py-1 placeholder-gray-400"
                      >
                        <option value="Like">Like</option>
                        <option value="Comment">Comment</option>
                        <option value="Quote Post">Quote Post</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-none max-w-xs w-full sm:w-56 h-48 flex flex-col border-2 border-dotted border-teal-300 rounded-lg p-2 bg-white dark:bg-gray-800 justify-between overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150">
                {postPreview ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full flex flex-col"
                  >
                    <div className="w-full h-28 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                      {postPreview.metadata.image?.item ? (
                        <img
                          src={postPreview.metadata.image.item}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {postPreview.author?.metadata?.picture ? (
                        <img
                          src={postPreview.author.metadata.picture}
                          alt={
                            postPreview.author.metadata.name ||
                            postPreview.author.username.value
                          }
                          className="w-6 h-6 rounded-full object-cover bg-blue-400"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-gray-700 truncate">
                        @{postPreview.author.username.value}
                      </span>
                    </div>
                    <div
                      className="text-xs text-black dark:text-white leading-snug overflow-hidden text-ellipsis mt-2"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {postPreview.metadata.content}
                    </div>
                  </a>
                ) : (
                  <div className="w-full h-full flex flex-col items-start justify-start">
                    <div className="w-full h-28 bg-gray-100 dark:bg-gray-700 rounded-md mb-2" />
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0" />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        @username
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 dark:text-gray-600 mt-2 w-full h-8 bg-gray-100 dark:bg-gray-700 rounded" />
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Followers Required
                </label>
                <div className="flex items-center bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
                  <input
                    type="number"
                    placeholder="Enter minimum followers"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm py-1 placeholder-gray-400 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Slots
                </label>
                <div className="flex items-center bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
                  <input
                    type="number"
                    placeholder="Enter max slots"
                    value={maxSlots}
                    onChange={(e) => setMaxSlots(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm py-1 placeholder-gray-400 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </label>
                <div className="flex items-center bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
                  <input
                    type="text"
                    placeholder="Enter time period"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm py-1 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          )}
          {step === 3 && type === "Quote Post" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Sample Step 3 Input
              </label>
              <div className="flex items-center bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
                <input
                  type="text"
                  placeholder="Enter sample input"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm py-1 placeholder-gray-400"
                />
              </div>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 text-center"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < (type === "Quote Post" ? 3 : 2) ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  step === 1 ? !link.trim() || Number(amount) < 1 : false
                }
                className="ml-auto px-4 py-2 rounded-full text-white bg-blue-500 text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
                Next
              </button>
            ) : (
              <button
                disabled={
                  !minFollowers.trim() || !maxSlots.trim() || !duration.trim()
                }
                className="ml-auto px-4 py-2 rounded-full text-white bg-green-500 text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-300 dark:focus:ring-green-800"
              >
                Create
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
