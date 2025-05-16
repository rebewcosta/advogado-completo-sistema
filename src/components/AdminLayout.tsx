
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Toaster } from "@/components/ui/toaster";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get user email or name for display
  const getUserInfo = () => {
    if (user?.user_metadata?.nome) {
      return user.user_metadata.nome;
    }
    return user?.email?.split('@')[0] || '';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "JG";
    
    const nome = user.user_metadata?.nome || user.email || "";
    if (!nome) return "JG";
    
    const parts = nome.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return nome.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Desconectado com sucesso",
        description: "Você foi desconectado do sistema.",
      });
      navigate('/');
    } catch (error) {
      // Erro já tratado no hook useAuth
    }
  };

  const handleProfileClick = () => {
    navigate('/perfil');
  };

  const handleSubscriptionClick = () => {
    navigate('/perfil?tab=assinatura');
  };

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-100">
          <div className="fixed top-0 left-0 right-0 z-50 bg-lawyer-dark h-14 px-4 flex items-center justify-between">
            <div className="flex items-center">
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
            
            {user && (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-white hover:bg-white/10">
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarFallback className="bg-white/10 text-white text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSubscriptionClick} className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notificações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <User className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {user && (
            <div className="fixed top-14 left-0 right-0 z-40 bg-gradient-to-r from-amber-100 to-amber-50 border-b border-amber-200">
              <div className="p-2 px-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-200 rounded-full h-6 w-6 flex items-center justify-center">
                    <User className="h-3 w-3 text-amber-800" />
                  </div>
                  <p className="text-sm font-medium text-amber-900">
                    {getUserInfo()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-auto pt-14 mt-10">
            {children}
          </div>
          <Toaster />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          {user && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-b border-amber-200">
              <div className="py-2 px-6 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-amber-200 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-amber-800" />
                  </div>
                  <p className="text-sm font-medium text-amber-900">
                    <span className="font-normal">Você está logado como</span> {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
