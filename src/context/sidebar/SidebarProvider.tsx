import { useState, useEffect, useMemo, type FC, type ReactNode } from "react";
import { SidebarContext } from "./SidebarContext";

type SidebarProviderProps = {
  children: ReactNode;
};

export const SidebarProvider: FC<SidebarProviderProps> = ({ children }) => {
  const [sidebarLeftIsVisible, setSidebarLeftIsVisible] = useState(false);
  const [sidebarRightIsVisible, setSidebarRightIsVisible] = useState(false);

  useEffect(() => {
    const left = localStorage.getItem("sidebarLeft");
    const right = localStorage.getItem("sidebarRight");

    if (left !== null) setSidebarLeftIsVisible(left === "true");
    if (right !== null) setSidebarRightIsVisible(right === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarLeft", String(sidebarLeftIsVisible));
  }, [sidebarLeftIsVisible]);

  useEffect(() => {
    localStorage.setItem("sidebarRight", String(sidebarRightIsVisible));
  }, [sidebarRightIsVisible]);

  const toggleSidebarLeft = () => {
    setSidebarLeftIsVisible((prev) => !prev);
  };

  const toggleSidebarRight = () => {
    setSidebarRightIsVisible((prev) => !prev);
  };

  const closeSidebarLeft = () => setSidebarLeftIsVisible(false);
  const closeSidebarRight = () => setSidebarRightIsVisible(false);

  const value = useMemo(
    () => ({
      sidebarLeftIsVisible,
      sidebarRightIsVisible,
      toggleSidebarLeft,
      toggleSidebarRight,
      closeSidebarLeft,
      closeSidebarRight,
    }),
    [sidebarLeftIsVisible, sidebarRightIsVisible]
  );

  return (
    // <div>hi</div>
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
