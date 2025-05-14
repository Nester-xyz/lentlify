import React from "react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useSidebar } from "@/context/sidebar/SidebarContext";
import { useModal } from "@/context/model/ModelContext";
import AbsoluteModal from "../modal/AbsoluteModal";
import { UseAuth } from "@/context/auth/AuthContext";

const SidebarFooter: React.FC = () => {
  const { sidebarLeftIsVisible } = useSidebar();
  const navigate = useNavigate();
  const footerRef = React.useRef<HTMLDivElement>(null);
  const { closeModal, openModal } = useModal();

  const { profile } = UseAuth();

  const handleLoginModal = () => {
    openModal(
      <AbsoluteModal open={true} onClose={closeModal}>
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 109 }}
            onClick={() => closeModal()}
            aria-label="Close profile menu"
            tabIndex={-1}
          />
          <div
            className="flex flex-col min-w-[180px] max-w-[90vw] rounded-xl shadow-2xl border border-gray-200 bg-white overflow-auto"
            style={{
              position: "fixed",
              left: 16,
              bottom: 72,
              zIndex: 110,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="px-5 py-3 text-left hover:bg-gray-200 text-gray-800 text-base font-medium transition-colors flex items-center gap-2"
              onClick={() => {
                navigate("/profile");
              }}
            >
              <CgProfile className="text-xl" />
              <span>View Profile</span>
            </button>
            <button
              className="px-5 py-3 text-left hover:bg-gray-200 text-red-600 text-base font-medium border-t border-gray-100 transition-colors flex items-center gap-2"
              onClick={() => {
                // logout();
                navigate("/login");
              }}
            >
              <RiLogoutCircleRLine className="text-xl" />
              <span>Log Out</span>
            </button>
          </div>
        </>
      </AbsoluteModal>
    );
  };

  return (
    <div className="p-2 border-t dark:border-gray-700 border-gray-300 relative">
      <div
        ref={footerRef}
        onClick={handleLoginModal}
        className={`flex items-center rounded-full cursor-pointer text-gray-300 hover:bg-gray-400 p-2 gap-3`}
        tabIndex={0}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden">
          {profile?.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "User"}
            </div>
          )}
        </div>
        {sidebarLeftIsVisible && (
          <span className="font-medium text-gray-700">{profile?.name}</span>
        )}
      </div>
    </div>
  );
};

export default SidebarFooter;
