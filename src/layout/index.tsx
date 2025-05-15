import React from "react";
import { SidebarProvider } from "../context/sidebar/SidebarProvider";
import { ModalProvider } from "@/context/model/ModelProvider";

type LayoutProps = {
  children: React.ReactNode;
};

const GeneralLayout = ({ children }: LayoutProps) => {
  return (
    <div>
      <ModalProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ModalProvider>
    </div>
  );
};

export default GeneralLayout;
