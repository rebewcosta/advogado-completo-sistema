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
      <div className="flex w-full bg-gray-50 relative">
        <AppSidebar />
        {/*
          MUDANÇA CRÍTICA:
          - 'h-screen' foi movido para cá para fazer desta a área de rolagem principal da página.
          - 'overflow-y-auto' garante que o conteúdo normal da página (como a lista de clientes) possa rolar.
        */}
        <main className="flex-1 h-screen overflow-y-auto min-w-0">
          {children}
        </main>
        <Toaster />
        <ListaAvisos />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;