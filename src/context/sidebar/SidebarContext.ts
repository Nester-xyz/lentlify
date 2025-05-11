import { createContext, useContext } from "react";

export type SidebarContextType = {
  sidebarLeftIsVisible: boolean;
  sidebarRightIsVisible: boolean;
  toggleSidebarLeft: () => void;
  toggleSidebarRight: () => void;
  closeSidebarLeft: () => void;
  closeSidebarRight: () => void;
};

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
