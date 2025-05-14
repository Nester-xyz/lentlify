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
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      {sidebarLeftIsVisible && (
        <h1 className="text-xl font-bold">{projectName}</h1>
      )}
      <Button
        onClick={() => toggleSidebarLeft()}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700  rounded-full p-4 "
      >
        <>
          {!sidebarLeftIsVisible ? (
            <TbLayoutSidebarLeftExpand className="w-6 h-6 text-5xl" />
          ) : (
            <TbLayoutSidebarRightExpand className="w-6 h-6 text-2xl" />
          )}
        </>
      </Button>
    </div>
  );
};

export default LogoHeader;
