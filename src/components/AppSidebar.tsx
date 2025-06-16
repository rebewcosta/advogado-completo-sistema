// src/components/AppSidebar.tsx
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
  Shield,
  ListChecks,
  UserCheck,
  AlertTriangle,
  Wrench
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // VERIFICAÇÃO CRÍTICA: apenas webercostag@gmail.com tem acesso admin
  const isAdmin = user?.email === 'webercostag@gmail.com';

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/ferramentas", icon: Wrench, label: "Ferramentas", isSpecial: true },
    { path: "/meus-processos", icon: FileText, label: "Meus Processos" },
    { path: "/clientes", icon: Users, label: "Clientes" },
    { path: "/equipe", icon: UserCheck, label: "Equipe" },
    { path: "/agenda", icon: Calendar, label: "Agenda" },
    { path: "/prazos", icon: AlertTriangle, label: "Prazos" },
    { path: "/tarefas", icon: ListChecks, label: "Tarefas" },
    { path: "/financeiro", icon: DollarSign, label: "Financeiro" },
    { path: "/documentos", icon: FileArchive, label: "Documentos" },
    { path: "/relatorios", icon: BarChart2, label: "Relatórios" },
    { path: "/configuracoes", icon: Settings, label: "Configurações" },
    // APENAS adiciona o item Admin se for webercostag@gmail.com
    ...(isAdmin ? [{ path: "/admin", icon: Shield, label: "Admin" }] : []),
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

  const getUserInitials = () => {
    if (!user) return "JG";
    
    const nome = user.user_metadata?.nome || user.email || "";
    if (!nome) return "JG";
    
    const parts = nome.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="bg-lawyer-dark border-b border-gray-700">
        <div className={`px-3 ${isMobile ? 'py-3' : 'py-4'} flex justify-between items-center`}>
          <Link to="/dashboard" className={`${isMobile ? 'text-base' : 'text-lg'} font-bold flex items-center gap-2 text-white`}>
            <img 
              src="/lovable-uploads/11a8e9cf-456c-4c4c-bd41-fac2efeaa537.png" 
              alt="JusGestão Logo" 
              className={`${isMobile ? 'h-5' : 'h-6'} w-auto`}
            />
            <span>JusGestão</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-lawyer-dark text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 text-xs uppercase tracking-wider px-3 py-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${item.isSpecial 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden'
                        : 'hover:bg-lawyer-primary/10 hover:text-lawyer-primary'
                      }
                      ${isActive(item.path) 
                        ? 'bg-lawyer-primary/20 text-lawyer-primary border-r-2 border-lawyer-primary' 
                        : item.isSpecial ? 'text-white' : 'text-gray-300'
                      }
                      ${isMobile ? 'text-sm' : 'text-base'}
                    `}
                  >
                    <Link to={item.path} className="flex items-center gap-3 w-full relative z-10">
                      <div className={`${item.isSpecial ? 'bg-white/20 p-1 rounded-md' : ''}`}>
                        <item.icon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0 ${item.isSpecial ? 'text-white' : ''}`} />
                      </div>
                      <span className={`truncate ${item.isSpecial ? 'font-semibold' : ''}`}>{item.label}</span>
                      {item.isSpecial && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-30"></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-lawyer-dark border-t border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors w-full">
                <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-lawyer-primary text-white text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white truncate`}>
                    {user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário'}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-4 mb-2 bg-white border border-gray-200 shadow-lg z-50" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/suporte" className="flex items-center cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Suporte</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
