import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useSidebar } from "@/context/sidebar/SidebarContext";
import { useModal } from "@/context/model/ModelContext";
import AbsoluteModal from "../modal/AbsoluteModal";
import { UseAuth } from "@/context/auth/AuthContext";
import { fetchAccount } from "@lens-protocol/client/actions";
import { client } from "../../lib/lens";

const SidebarFooter: React.FC = () => {
  const { sidebarLeftIsVisible } = useSidebar();
  const navigate = useNavigate();
  const footerRef = useRef<HTMLDivElement>(null);
  const { closeModal, openModal } = useModal();

  const { selectedAccount, profile, setProfile, logout } = UseAuth();

  useEffect(() => {
    if (!selectedAccount?.address) return;
    (async () => {
      const result = await fetchAccount(client, {
        address: selectedAccount.address,
      });
      if (result.isErr()) {
        console.error("Failed to fetch account:", result.error);
        return;
      }
      const account = result.value;
      if (!account) return;
      const name = account.username?.localName || "";
      const image = account.metadata?.picture;
      const p = {
        address: selectedAccount.address,
        name,
        image,
        bio: account.metadata?.bio || "",
        coverPicture: account.metadata?.coverPicture,
        createdAt: account.createdAt,
      };
      if (typeof setProfile === "function") {
        setProfile(p);
      }
      localStorage.setItem("sidebarProfile", JSON.stringify(p));
    })();
  }, [selectedAccount, setProfile]);

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
            className="flex flex-col min-w-[180px] max-w-[90vw] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-auto"
            style={{
              position: "fixed",
              left: 16,
              bottom: 72,
              zIndex: 110,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="px-5 py-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium transition-colors flex items-center gap-2"
              onClick={() => {
                closeModal();
                navigate("/profile");
              }}
            >
              <CgProfile className="text-xl" />
              <span>View Profile</span>
            </button>
            <button
              className="px-5 py-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 text-base font-medium border-t border-gray-100 dark:border-gray-700 transition-colors flex items-center gap-2"
              onClick={() => {
                logout();
                closeModal();
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
    <div className="p-2 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 relative">
      <div
        ref={footerRef}
        onClick={handleLoginModal}
        className={`flex items-center rounded-full cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 gap-3 transition-colors`}
        tabIndex={0}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-blue-500">
          {profile?.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "User"}
            </div>
          )}
        </div>
        {sidebarLeftIsVisible && (
          <span className="font-medium text-gray-700 dark:text-gray-200">{profile?.name}</span>
        )}
      </div>
    </div>
  );
};

export default SidebarFooter;
