import React from "react";
import SidebarLayout from "./sidebar/SidebarLayout";
import { SidebarProvider } from "../context/sidebar/SidebarProvider";

type LayoutProps = {
  children: React.ReactNode;
};

const GeneralLayout = ({ children }: LayoutProps) => {
  return (
    <div>
      <SidebarProvider>
        <SidebarLayout>{children}</SidebarLayout>
      </SidebarProvider>
    </div>
  );
};

export default GeneralLayout;
