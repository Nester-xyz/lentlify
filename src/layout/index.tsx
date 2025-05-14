import React from "react";
import SidebarLayout from "./sidebar/SidebarLayout";
import { SidebarProvider } from "../context/sidebar/SidebarProvider";
import { ModalProvider } from "@/context/model/ModelProvider";

type LayoutProps = {
  children: React.ReactNode;
};

const GeneralLayout = ({ children }: LayoutProps) => {
  return (
    <div>
      <ModalProvider>
        <SidebarProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </SidebarProvider>
      </ModalProvider>
    </div>
  );
};

export default GeneralLayout;
