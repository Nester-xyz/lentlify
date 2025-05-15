import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { IoCloudUploadOutline } from "react-icons/io5";
import { storageClient } from "@/lib/lens";
import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
import acl from "@/lib/acl";


interface Profile {
  name: string;
  address: string;
  image?: string;
  bio: string;
  coverPicture?: string;
  createdAt: string;
}

const CreateCampaignGroup: React.FC = () => {
  const profile = useOutletContext<Profile | null>();
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  
  // Status and error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentHash, setContentHash] = useState<string>("");
  const [groveUri, setGroveUri] = useState<string>("");
  const [shouldExecuteContract, setShouldExecuteContract] = useState(false);

  // Contract interaction hook
  const { 
    createCampaignGroup,
    isCreateGroupPending, 
    isCreateGroupConfirming,
    isCreateGroupConfirmed,
    createGroupHash
  } = useLensAdCampaignMarketplace();

  // Image preview handlers
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

  // When transaction is confirmed, navigate to details page
  useEffect(() => {
    if (isCreateGroupConfirmed) {
      navigate(`/campaign/${contentHash}`, { 
        state: { 
          metaUri: groveUri, 
          payload: {
            name,
            description,
            owner: profile?.address,
            coverPhoto: coverPhotoUrl,
            profilePhoto: profilePhotoUrl
          }
        } 
      });
    }
  }, [isCreateGroupConfirmed, navigate, contentHash, groveUri, name, description, profile, coverPhotoUrl, profilePhotoUrl]);
  
  // Effect to execute contract call when URI is ready
  useEffect(() => {
    const executeContractCall = async () => {
      if (shouldExecuteContract && groveUri) {
        try {
          console.log("Executing contract call with URI:", groveUri);
          await createCampaignGroup(groveUri);
          console.log("Campaign group creation initiated");
          setShouldExecuteContract(false); // Reset flag after execution
        } catch (err: any) {
          console.error("Error during contract execution:", err);
          setError(err.message || "Error creating campaign group");
          setIsSubmitting(false);
          setShouldExecuteContract(false); // Reset flag on error
        }
      }
    };
    
    executeContractCall();
  }, [shouldExecuteContract, groveUri, createCampaignGroup]);
  
  // Add debug logging for contract interaction states
  useEffect(() => {
    console.log("Contract interaction state:", {
      isPending: isCreateGroupPending,
      isConfirming: isCreateGroupConfirming,
      isConfirmed: isCreateGroupConfirmed
    });
    
    // If transaction fails, show error
    if (!isCreateGroupConfirming && !isCreateGroupConfirmed && isCreateGroupPending === false) {
      setError("Transaction failed. Please check console for details.");
      setIsSubmitting(false);
    }
  }, [isCreateGroupPending, isCreateGroupConfirming, isCreateGroupConfirmed]);

  // File input handlers
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

  // Two-step submission process:
  // 1. Upload content to Grove storage
  // 2. Create campaign group on-chain with the content URI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload files and content to Grove storage
      let coverUri: string | null = null;
      if (coverPhoto) {
        const fileRes = await storageClient.uploadFile(coverPhoto, { acl });
        coverUri = fileRes.gatewayUrl;
      }
      console.log("Cover URI:", coverUri);
      
      let profileUri: string | null = null;
      if (profilePhoto) {
        const profRes = await storageClient.uploadFile(profilePhoto, { acl });
        profileUri = profRes.gatewayUrl;
      }
      console.log("Profile URI:", profileUri);
      
      const payload = {
        name,
        description,
        owner: profile?.address,
        coverPhoto: coverUri,
        profilePhoto: profileUri,
        createdAt: new Date().toISOString()
      };
      
      const metaRes = await storageClient.uploadAsJson(payload, { acl });
      console.log("Storage response:", metaRes);
      
      const metaUri = metaRes.uri;
      console.log("Meta URI:", metaUri);
      const hash = metaUri.replace("lens://", "");
      console.log("Meta hash:", hash);
      
      // Step 2: Prepare for campaign group creation on-chain
      // Save the content hash and Grove URI for use in the contract call
      setContentHash(hash);
      setGroveUri(metaUri);
      
      // Set flag to trigger contract execution in the useEffect
      setShouldExecuteContract(true);
      console.log("Campaign group creation prepared with URI:", metaUri);
    } catch (err: any) {
      setError(err.message || "Error creating campaign group");
      setIsSubmitting(false);
    }
  };

  // Determine the button state/text based on the transaction state
  const getButtonText = () => {
    if (isSubmitting && !isCreateGroupPending) return "Uploading to Grove...";
    if (isCreateGroupPending) return "Preparing transaction...";
    if (isCreateGroupConfirming) return "Confirming transaction...";
    return "Create Campaign Group";
  };

  const isButtonDisabled = isSubmitting || isCreateGroupPending || isCreateGroupConfirming;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-300">
        <h1 className="text-2xl font-bold mb-6">Create Campaign Group</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Campaign Group Name
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm placeholder-gray-400"
                placeholder="Enter campaign group name"
                required
                disabled={isButtonDisabled}
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg p-2 px-3 border-2 border-transparent focus-within:border-teal-400 transition-colors duration-200">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm placeholder-gray-400"
                placeholder="Enter description"
                rows={4}
                required
                disabled={isButtonDisabled}
              />
            </div>
          </div>
          
          {/* Profile Photo */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Profile Photo
            </label>
            {profilePhotoUrl ? (
              <div className="relative w-24 h-24">
                <div className="rounded-full overflow-hidden border border-gray-300 w-full h-full">
                  <img
                    src={profilePhotoUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeProfilePhoto}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 cursor-pointer"
                  disabled={isButtonDisabled}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600"
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
                  className={`relative flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 hover:border-teal-400 transition-colors duration-200 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <IoCloudUploadOutline className="h-6 w-6 text-gray-500" />
                </label>
                <input
                  id="profilePhotoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                  disabled={isButtonDisabled}
                />
              </>
            )}
          </div>
          
          {/* Cover Photo */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Cover Photo
            </label>
            {coverPhotoUrl ? (
              <div className="relative border border-gray-300 rounded-lg w-full h-36 overflow-hidden">
                <img
                  src={coverPhotoUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverPhoto}
                  className="absolute top-2 right-2 bg-white cursor-pointer rounded-full p-1 shadow hover:bg-gray-100"
                  disabled={isButtonDisabled}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600"
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
                  className={`relative flex flex-col items-center justify-center w-full h-36 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-400 transition-colors duration-200 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <IoCloudUploadOutline className="h-8 w-8 text-gray-500" />
                  <span className="text-sm text-gray-500 mt-2">
                    Click to upload
                  </span>
                </label>
                <input
                  id="coverPhotoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                  disabled={isButtonDisabled}
                />
              </>
            )}
          </div>
          
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          {createGroupHash && !isCreateGroupConfirmed && (
            <div className="text-blue-500 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
              Transaction submitted! Waiting for confirmation...
              <a 
                href={`https://testnet.lensscan.io/tx/${createGroupHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block mt-1"
              >
                View on explorer
              </a>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full py-2 rounded-full transition ${
              isButtonDisabled 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {getButtonText()}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignGroup;