// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogOut, LayoutDashboard, Menu as MenuIcon } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils'; // Importar cn para mesclar classes

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
  // Removidos os console.logs e texto de teste visual para limpeza final
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8">
      <div className="flex items-center flex-1 min-w-0">
        <LayoutDashboard className="h-7 w-7 sm:h-8 sm:w-8 text-lawyer-primary mr-2 sm:mr-3 flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left truncate">Dashboard</h1>
          <div className="text-sm text-gray-600 text-left">
            <span className="block sm:inline">Bem-vindo(a), {getUserFirstName()}.</span>
            <span className="block sm:inline sm:ml-1">Aqui está o resumo do seu escritório.</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 self-start sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 order-1"
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
        {/* Botão do Menu Gaveta para Mobile com Estilo Atualizado */}
        <div className="md:hidden order-2">
          <SidebarTrigger
            variant="default" // Mudando para 'default' para usar cores primárias
            size="icon"
            className={cn(
              "h-8 w-8 text-white shadow-md", // Tamanho base e sombra (h-8 w-8 é o que estava antes)
              "bg-lawyer-primary hover:bg-lawyer-primary/90", // Cor de fundo primária e hover
              "focus-visible:ring-2 focus-visible:ring-lawyer-primary focus-visible:ring-offset-2" // Estilos de foco
            )}
          >
            <MenuIcon className="h-5 w-5" /> 
          </SidebarTrigger>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;