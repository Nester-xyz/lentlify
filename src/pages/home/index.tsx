import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { FaPlus } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const { address } = useAccount();

  // Debug log for wallet address
  useEffect(() => {
    console.log('Current wallet address:', address);
  }, [address]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Lentlify</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/campaign")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-2" /> Manage Campaigns
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Ad Campaign Platform</h2>
          <p className="text-gray-300 mb-4">
            Create and manage your advertising campaigns with Lentlify. Connect with influencers and grow your brand presence.
          </p>
          <div className="flex space-x-4 mt-6">
            <button 
              onClick={() => navigate("/campaign")} 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              View Campaigns
            </button>
            <button 
              onClick={() => navigate("/create-ad")} 
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Create New Ad
            </button>
            <button
              onClick={() => navigate("/create")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-2" /> Create Campaign
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">Campaign Management</h3>
            <p className="text-gray-300 mb-4">Create and manage your campaign groups to organize your advertising efforts.</p>
            <button 
              onClick={() => navigate("/campaign")} 
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Manage campaigns →
            </button>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">Ad Creation</h3>
            <p className="text-gray-300 mb-4">Create compelling ads that will reach your target audience effectively.</p>
            <button 
              onClick={() => navigate("/create-ad")} 
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Create new ad →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
