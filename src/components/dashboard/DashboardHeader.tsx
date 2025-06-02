
// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      {/* Seção do Título e Ícone (ocupa espaço disponível) */}
      <div className="flex items-center flex-1 min-w-0"> {/* flex-1 para ocupar espaço */}
        <LayoutDashboard className="h-7 w-7 sm:h-8 sm:w-8 text-lawyer-primary mr-2 sm:mr-3 flex-shrink-0" />
        <div className="min-w-0"> {/* Para truncar texto se necessário */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left truncate">Dashboard</h1>
          <div className="text-sm text-gray-600 text-left">
            <span className="block sm:inline">Bem-vindo(a), {getUserFirstName()}.</span>
            <span className="block sm:inline sm:ml-1">Aqui está o resumo do seu escritório.</span>
          </div>
        </div>
      </div>

      {/* Seção de Botões (Sair e Menu Mobile) */}
      <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 self-start sm:self-center"> {/* Ajustado self-start e self-center */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 order-1" // Botão de sair
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
        {/* Botão do Menu Gaveta para Mobile */}
        <div className="md:hidden order-2"> {/* Visível apenas abaixo de md */}
          <SidebarTrigger
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
