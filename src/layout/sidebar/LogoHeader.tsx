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
    <div className="flex items-center justify-between border-b dark:border-gray-700 border-gray-300">
      {sidebarLeftIsVisible && (
        <div className="text-4xl font-bold px-2">{projectName}</div>
      )}
      <Button
        onClick={() => toggleSidebarLeft()}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full"
      >
        <>
          {sidebarLeftIsVisible ? (
            <TbLayoutSidebarLeftExpand className="" />
          ) : (
            <TbLayoutSidebarRightExpand className="" />
          )}
        </>
      </Button>
    </div>
  );
};

export default LogoHeader;
