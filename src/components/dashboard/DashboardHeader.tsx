// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogOut, LayoutDashboard, Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Button pode não ser necessário aqui se SidebarTrigger for suficiente
import { User } from '@supabase/supabase-js';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardHeaderProps {
  user: User | null;
  getUserFirstName: () => string;
  handleSignOut: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  getUserFirstName, 
  handleSignOut 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8">
      <div className="flex items-center w-full sm:w-auto">
        {/* Botão do Menu Gaveta para Mobile */}
        <div className="md:hidden mr-2"> 
          {/* SidebarTrigger já é um botão. Se você quiser um estilo específico de botão, 
            aplique as classes diretamente no SidebarTrigger ou não use asChild 
            e deixe o SidebarTrigger renderizar seu próprio botão padrão.
            Se for para aplicar o estilo do <Button variant="ghost" size="icon">,
            você passa essas props para o SidebarTrigger e o <MenuIcon/> como filho DIRETO.
          */}
          <SidebarTrigger 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900" // Adicionando hover:text-gray-900 para melhor feedback
          >
            <MenuIcon className="h-5 w-5" />
          </SidebarTrigger>
        </div>
        <LayoutDashboard className="h-7 w-7 sm:h-8 sm:w-8 text-lawyer-primary mr-2 sm:mr-3" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">Dashboard</h1>
          <p className="text-sm text-gray-600 text-left">
            Bem-vindo(a), {getUserFirstName()}. Aqui está o resumo do seu escritório.
          </p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 self-start sm:self-auto mt-3 sm:mt-0"
      >
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </div>
  );
};

export default DashboardHeader;