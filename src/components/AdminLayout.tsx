
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Toaster } from "@/components/ui/toaster";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 overflow-auto min-w-0">
          {children}
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
