import React from "react";
import LogoHeader from "./LogoHeader";
import { useSidebar } from "../../context/sidebar/SidebarContext";
import SidebarNavigtion from "./SidebarNavigation";

type SidebarLayoutProps = {
  children: React.ReactNode;
};

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { sidebarLeftIsVisible } = useSidebar();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-amber-300 relative">
      <aside
        className={`${
          sidebarLeftIsVisible ? "w-64" : "w-16"
        } dark:bg-gray-800 dark:text-white bg-gray-100 text-gray-800 transition-all duration-300 ease-in-out flex flex-col relative`}
      >
        <LogoHeader />
        <SidebarNavigtion />
      </aside>

      <main className="w-full">
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 dark:text-white delay-100 flex p-4 h-full w-full">
          <div className="max-w-2xl ">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
