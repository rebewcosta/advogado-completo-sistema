
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  FileArchive, 
  BarChart2, 
  Settings,
  LogOut,
  User,
  CreditCard
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define menu items
  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/clientes", icon: Users, label: "Clientes" },
    { path: "/processos", icon: FileText, label: "Processos" },
    { path: "/agenda", icon: Calendar, label: "Agenda" },
    { path: "/financeiro", icon: DollarSign, label: "Financeiro" },
    { path: "/documentos", icon: FileArchive, label: "Documentos" },
    { path: "/relatorios", icon: BarChart2, label: "Relatórios" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
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

  // Obtém as iniciais do nome do usuário para o avatar
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-3 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-lg font-bold flex items-center gap-2">
            <img 
              src="/lovable-uploads/11a8e9cf-456c-4c4c-bd41-fac2efeaa537.png" 
              alt="JusGestão Logo" 
              className="h-6 w-auto"
            />
            <span>JusGestão</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.label}
                    isActive={isActive(item.path)}
                  >
                    <Link to={item.path}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Configurações"
              isActive={isActive("/configuracoes")}
            >
              <Link to="/configuracoes">
                <Settings className="w-5 h-5" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <div className="px-3 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 w-full p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">
                      {user?.user_metadata?.nome || user?.email || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/perfil?tab=assinatura" className="flex items-center cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Assinatura</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};
