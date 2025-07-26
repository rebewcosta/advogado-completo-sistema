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
      {/* A div principal agora não força uma altura fixa, permitindo que o conteúdo interno cresça */}
      <div className="flex w-full bg-gray-50 relative">
        <AppSidebar />
        {/* O 'main' agora é responsável pelo scroll de seu próprio conteúdo */}
        <div className="flex-1 overflow-y-auto min-w-0 h-screen">
          {children}
        </div>
        <Toaster />
        <ListaAvisos />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;