import LogoHeader from "./LogoHeader";
import { useSidebar } from "../../context/sidebar/SidebarContext";
import SidebarNavigtion from "./SidebarNavigation";
import SidebarRight from "./SidebarRight";
import SidebarFooter from "./SidebarFooter";
import { Outlet } from "react-router-dom";

// SidebarLayout uses nested routes via <Outlet>

const SidebarLayout = () => {
  const { sidebarLeftIsVisible, sidebarRightIsVisible } = useSidebar();

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-white">
      <aside
        className={`${
          sidebarLeftIsVisible ? "w-64" : "w-16"
        }  bg-gray-100 text-gray-800 transition-all duration-300 ease-in-out flex flex-col relative`}
      >
        <LogoHeader />
        <SidebarNavigtion />
        <SidebarFooter />
      </aside>

      <main className="w-full">
        <div className="flex-1 overflow-auto bg-white  dark:bg-gray-900 dark:text-white delay-100 flex p-4 h-full w-full">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </main>

      {sidebarRightIsVisible && (
        <aside className="w-[26rem]  dark:bg-gray-800 text-gray-800 dark:text-white transition-all duration-300 ease-in-out flex flex-col relative">
          {/* Right Sidebar Content */}
          <div className="p-4">
            <SidebarRight />
          </div>
        </aside>
      )}
    </div>
  );
};

export default SidebarLayout;
