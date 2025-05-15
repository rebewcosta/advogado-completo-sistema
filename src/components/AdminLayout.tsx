
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
