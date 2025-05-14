import { useSidebar } from "@/context/sidebar/SidebarContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const { openSidebarRight } = useSidebar();

  useEffect(() => {
    openSidebarRight();
  }, [openSidebarRight]);

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col items-center space-y-6">
      <button
        onClick={() => navigate("/create")}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Create Campaign
      </button>
      <button
        onClick={() => navigate("/create-ad")}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Create AD
      </button>
    </div>
  );
};

export default Home;
