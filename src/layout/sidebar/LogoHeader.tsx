import {
  TbLayoutSidebarLeftExpand,
  TbLayoutSidebarRightExpand,
} from "react-icons/tb";
import { useSidebar } from "../../context/sidebar/SidebarContext";
import { useState } from "react";
import { Button } from "../../components/atoms/Button";

const LogoHeader = () => {
  const { sidebarLeftIsVisible, toggleSidebarLeft } = useSidebar();
  const [projectName] = useState("Lentlify");

  return (
    <div className="p-2 border-b dark:border-gray-700 border-gray-300 bg-white dark:bg-gray-900 flex items-center relative">
      {sidebarLeftIsVisible && (
        <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-200 ml-2 select-none">
          {projectName}
        </h1>
      )}
      <div className="flex-1" />
      <Button
        onClick={toggleSidebarLeft}
        className="w-12 h-12 flex items-center justify-center rounded-full focus:outline-none transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={
          sidebarLeftIsVisible ? "Collapse sidebar" : "Expand sidebar"
        }
      >
        <span
          className={`transition-transform duration-300 ease-in-out inline-block scale-150`}
        >
          {sidebarLeftIsVisible ? (
            <TbLayoutSidebarRightExpand />
          ) : (
            <TbLayoutSidebarLeftExpand />
          )}
        </span>
      </Button>
    </div>
  );
};

export default LogoHeader;
