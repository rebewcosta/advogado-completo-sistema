
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Settings 
} from 'lucide-react';

export const AppSidebar = () => {
  const location = useLocation();

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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-4">
          <h2 className="text-lg font-bold">JusGestão</h2>
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
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};
