import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLensAdCampaignMarketplace } from "@/hooks/useLensAdCampaignMarketplace";
import { useNavigate } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { storageClient } from "@/lib/lens";

// Define the campaign group data structure
interface CampaignGroupData {
  groupURI: string;
  owner: string;
  postCampaignIds: number[];
  metadata?: {
    name: string;
    description: string;
    coverPhoto?: string;
    profilePhoto?: string;
  };
}

const CampaignGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCampaignGroup, CONTRACT_ADDRESS } = useLensAdCampaignMarketplace();
  
  const [campaignGroup, setCampaignGroup] = useState<CampaignGroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if the component is mounted to prevent state updates after unmount
  const isMountedRef = React.useRef(true);
  
  useEffect(() => {
    // Set up cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    const fetchCampaignGroup = async () => {
      if (!id) {
        setError("Campaign group ID is required");
        setIsLoading(false);
        return;
      }
      
      // Prevent duplicate fetches
      if (!isLoading) {
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching campaign group ${id} from contract ${CONTRACT_ADDRESS}`);
        
        // Fetch campaign group data from the contract
        const groupData = await getCampaignGroup(Number(id)) as any;
        console.log('Campaign group data:', groupData);
        
        if (!groupData || !groupData.groupURI) {
          setError(`Campaign group with ID ${id} not found or has invalid data`);
          setIsLoading(false);
          return;
        }

        // Fetch metadata if available
        let metadata = {};
        if (groupData.groupURI) {
          try {
            // Handle lens:// protocol URLs
            let fetchUrl = groupData.groupURI;
            
            // If it's a lens:// URL, use storageClient.resolve to get the proper URL
            if (fetchUrl.startsWith('lens://')) {
              // Extract the content hash from the lens:// URL
              const contentHash = fetchUrl.replace('lens://', '');
              console.log('Content hash from lens URI:', contentHash);
              
              try {
                // Use storageClient to resolve the lens:// URI to an HTTPS URL
                fetchUrl = storageClient.resolve(fetchUrl);
                console.log('Resolved lens URI to:', fetchUrl);
                
                // Fetch metadata from the resolved URL
                const metadataResponse = await fetch(fetchUrl);
                if (metadataResponse.ok) {
                  metadata = await metadataResponse.json();
                  console.log('Campaign group metadata from lens URI:', metadata);
                } else {
                  throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`);
                }
              } catch (resolveErr) {
                console.error('Error resolving lens URI:', resolveErr);
                // Use placeholder metadata if resolution fails
                metadata = {
                  name: `Campaign Group ${id}`,
                  description: `Campaign group with content hash: ${contentHash}`,
                };
                console.log('Using placeholder metadata for lens:// URI');
              }
            } else {
              // For regular URLs, fetch as normal
              const metadataResponse = await fetch(fetchUrl);
              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
                console.log('Campaign group metadata:', metadata);
              }
            }
          } catch (err) {
            console.error(`Error handling metadata for group ${id}:`, err);
            // Use placeholder metadata on error
            metadata = {
              name: `Campaign Group ${id}`,
              description: 'Metadata could not be loaded'
            };
          }
        }

        // Combine contract data with metadata
        setCampaignGroup({
          ...groupData,
          metadata
        });
        
        // Log the result as requested
        console.log(`Campaign Group ${id} Result:`, {
          groupURI: groupData.groupURI,
          owner: groupData.owner,
          postCampaignIds: groupData.postCampaignIds || []
        });
        
      } catch (err: any) {
        console.error('Error fetching campaign group:', err);
        setError(err.message || 'Failed to load campaign group');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignGroup();
  }, [id, getCampaignGroup, CONTRACT_ADDRESS]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Campaign Group Details</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          Back
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Campaign group details */}
      {!isLoading && !error && campaignGroup && (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {/* Cover photo */}
          <div className="h-48 bg-gray-700 relative">
            {campaignGroup.metadata?.coverPhoto ? (
              <img 
                src={campaignGroup.metadata.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900"></div>
            )}
          </div>
          
          {/* Profile section */}
          <div className="px-6 pt-4 pb-2 relative">
            {/* Profile photo */}
            <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-700">
              {campaignGroup.metadata?.profilePhoto ? (
                <img 
                  src={campaignGroup.metadata.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              )}
            </div>
            
            {/* Group info */}
            <div className="ml-40">
              <h2 className="text-xl font-bold text-white">{campaignGroup.metadata?.name || `Campaign Group #${id}`}</h2>
              <p className="text-gray-400 text-sm mb-2 truncate">
                Owner: {campaignGroup.owner}
              </p>
              <p className="text-gray-300 mb-4">{campaignGroup.metadata?.description || 'No description available'}</p>
              
              {/* Group URI */}
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <span className="mr-2">Group URI:</span>
                <a 
                  href={campaignGroup.groupURI} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center"
                >
                  {campaignGroup.groupURI.substring(0, 30)}...
                  <FiExternalLink className="ml-1" />
                </a>
              </div>
              
              {/* Contract Info */}
              <div className="text-sm text-gray-400">
                {/* <p>Contract Address: {CONTRACT_ADDRESS}</p> */}
                <p>Total Campaigns: {campaignGroup.postCampaignIds?.length || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Technical details section */}
          <div className="border-t border-gray-700 mt-6 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Technical Details</h3>
            <div className="bg-gray-900 p-4 rounded-md overflow-x-auto text-white">
              {/* <pre className="text-gray-300 text-sm">
                {JSON.stringify({
                  id,
                  groupURI: campaignGroup.groupURI,
                  owner: campaignGroup.owner,
                  postCampaignIds: campaignGroup.postCampaignIds || []
                }, null, 2)}
              </pre> */}
              Posts here
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignGroupDetail;
