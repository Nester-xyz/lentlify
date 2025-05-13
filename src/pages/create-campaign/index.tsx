import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { UseAuth as useAuth } from "@/context/auth/AuthContext";
import { storageClient } from "@/lib/lens";
import acl from "@/lib/acl";
import { IoCloudUploadOutline } from "react-icons/io5";
import { Spinner } from "@/components/atoms/Spinner";
interface Profile {
  name: string;
  address: string;
  image?: string;
  bio: string;
  coverPicture?: string;
  createdAt: string;
}

const CreateCampaign = () => {
  const profile = useOutletContext<Profile | null>();
  const { selectedAccount } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [campaignIds, setCampaignIds] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coverPhoto) {
      const url = URL.createObjectURL(coverPhoto);
      setCoverPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverPhotoUrl(null);
    }
  }, [coverPhoto]);

  useEffect(() => {
    if (profilePhoto) {
      const url = URL.createObjectURL(profilePhoto);
      setProfilePhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProfilePhotoUrl(null);
    }
  }, [profilePhoto]);

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPhoto(e.target.files[0]);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const removeCoverPhoto = () => {
    setCoverPhoto(null);
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      let coverUri: string | null = null;
      if (coverPhoto) {
        const fileRes = await storageClient.uploadFile(coverPhoto, { acl });
        coverUri = fileRes.gatewayUrl;
      }
      let profileUri: string | null = null;
      if (profilePhoto) {
        const profRes = await storageClient.uploadFile(profilePhoto, { acl });
        profileUri = profRes.gatewayUrl;
      }
      const ids = campaignIds.split(",").map((id) => id.trim());
      const payload = {
        name,
        description,
        owner: profile?.address ?? selectedAccount?.address,
        coverPhoto: coverUri,
        profilePhoto: profileUri,
        campaignIds: ids,
        createdAt: new Date().toISOString(),
      };
      const metaRes = await storageClient.uploadAsJson(payload, {
        acl: acl,
      });
      console.log(metaRes);
      const metaUri = metaRes.uri;
      const id = metaUri.replace("lens://", "");
      localStorage.setItem(
        `campaign_${id}`,
        JSON.stringify({ metaUri, payload })
      );
      navigate(`/campaign/${id}`, { state: { metaUri, payload } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          Create Campaign
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campaign Name
            </label>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter campaign name"
                required
              />
            </div>
          </div>
          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter description"
                rows={4}
                required
              />
            </div>
          </div>
          {/* Profile Photo */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Photo
            </label>
            {profilePhotoUrl ? (
              <div className="relative w-24 h-24">
                <div className="rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 w-full h-full">
                  <img
                    src={profilePhotoUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeProfilePhoto}
                  className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <label
                  htmlFor="profilePhotoUpload"
                  className="relative flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 transition-colors duration-200 cursor-pointer"
                >
                  <IoCloudUploadOutline className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </label>
                <input
                  id="profilePhotoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          {/* Cover Photo */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Photo
            </label>
            {coverPhotoUrl ? (
              <div className="relative border border-gray-300 dark:border-gray-700 rounded-lg w-full h-36 overflow-hidden">
                <img
                  src={coverPhotoUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverPhoto}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 cursor-pointer rounded-full p-1 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <label
                  htmlFor="coverPhotoUpload"
                  className="relative flex flex-col items-center justify-center w-full h-36 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 transition-colors duration-200 cursor-pointer"
                >
                  <IoCloudUploadOutline className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Click to upload
                  </span>
                </label>
                <input
                  id="coverPhotoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          {/* Campaign IDs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campaign IDs
            </label>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
              <input
                type="text"
                value={campaignIds}
                onChange={(e) => setCampaignIds(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g., 1001,1002,1003"
                required
              />
            </div>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-500 transition flex items-center justify-center focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 animate-spin" size="sm" /> Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
