import { FaHome, FaBell } from "react-icons/fa";
import { LiaBandcamp } from "react-icons/lia";

export type SidebarItem = {
  sidebarItem: string;
  sidebarPath: string;
  sidebarIcon: React.ReactNode;
};

export const SidebarList: SidebarItem[] = [
  { sidebarItem: "Home", sidebarPath: "/", sidebarIcon: <FaHome /> },
  {
    sidebarItem: "Campaign",
    sidebarPath: "/campaign",
    sidebarIcon: <LiaBandcamp />,
  },
  {
    sidebarItem: "Notifications",
    sidebarPath: "/notifications",
    sidebarIcon: <FaBell />,
  },
];
