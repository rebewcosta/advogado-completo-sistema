
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Toaster } from "@/components/ui/toaster";
import ListaAvisos from './avisos/ListaAvisos';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 relative">
        <AppSidebar />
        <div className="flex-1 overflow-auto min-w-0">
          {children}
        </div>
        <Toaster />
        
        {/* Lista de avisos - aparece sempre no canto superior direito */}
        <ListaAvisos />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
