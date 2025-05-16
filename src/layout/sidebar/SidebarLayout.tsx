import LogoHeader from "./LogoHeader";
import { useSidebar } from "../../context/sidebar/SidebarContext";
import SidebarNavigtion from "./SidebarNavigation";
import SidebarRight from "./SidebarRight";
import SidebarFooter from "./SidebarFooter";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

// SidebarLayout uses nested routes via <Outlet>

const SidebarLayout = () => {
  const { sidebarLeftIsVisible, sidebarRightIsVisible, openSidebarRight } = useSidebar();

  useEffect(() => {
    if (!sidebarRightIsVisible) openSidebarRight();
  }, [sidebarRightIsVisible, openSidebarRight]);

  return (
    <div className="flex h-screen w-screen relative bg-white dark:bg-gray-900 overflow-hidden">
      <div className="relative h-full bg-white dark:bg-gray-900">
        <aside
          className={`${
            sidebarLeftIsVisible ? "w-60" : "w-16"
          } bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out flex flex-col h-full`}
          style={{ zIndex: 10 }}
        >
          <LogoHeader />
          <SidebarNavigtion />
          <SidebarFooter />
        </aside>
        {/* Border as a separate absolutely positioned element */}
        <div className="absolute top-0 right-0 h-full w-px bg-gray-300 dark:bg-gray-700 pointer-events-none" />
      </div>

      <main className="flex-1">
        <div className="flex-1 overflow-auto bg-white  dark:bg-gray-900 dark:text-white delay-100 flex p-4 h-full w-full">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </main>

      {sidebarRightIsVisible && (
        <aside className="border-l border-gray-300 dark:border-gray-700 flex-none w-[20rem] dark:bg-gray-900 text-gray-800 dark:text-white transition-all duration-300 ease-in-out flex flex-col relative">
          {/* Right Sidebar Content */}
          <div className="p-2">
            <SidebarRight />
          </div>
        </aside>
      )}
    </div>
  );
};

export default SidebarLayout;
