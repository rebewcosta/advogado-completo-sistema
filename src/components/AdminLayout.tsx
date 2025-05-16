
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Toaster } from "@/components/ui/toaster";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="flex h-screen w-full bg-gray-100">
        <div className="fixed top-0 left-0 right-0 z-50 bg-lawyer-dark h-14 px-4 flex items-center">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[75%] bg-lawyer-dark">
              <div className="h-full">
                <AppSidebar />
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-4">
            <img 
              src="/lovable-uploads/11a8e9cf-456c-4c4c-bd41-fac2efeaa537.png" 
              alt="JusGestão Logo" 
              className="h-6 w-auto"
            />
          </div>
          <span className="ml-2 text-white font-bold">JusGestão</span>
        </div>
        <div className="flex-1 overflow-auto pt-14">
          {children}
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
