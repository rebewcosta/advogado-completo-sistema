
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
      <div className="flex h-screen w-full bg-gray-50" style={{ gap: '0px' }}>
        <AppSidebar />
        <main className="flex-1 overflow-auto" style={{ marginLeft: '0px', paddingLeft: '0px' }}>
          {children}
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
