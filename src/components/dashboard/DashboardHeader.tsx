// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
// GARANTIR QUE ESTA IMPORTAÇÃO ESTÁ CORRETA E SENDO USADA:
import { LogOut, LayoutDashboard, Menu as MenuIcon } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { SidebarTrigger } from '@/components/ui/sidebar';

// Log para verificar a importação
console.log("DashboardHeader.tsx: MenuIcon importado:", typeof MenuIcon, MenuIcon);

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
  if (typeof MenuIcon !== 'function' && typeof MenuIcon !== 'object') {
    console.error("DashboardHeader.tsx: MenuIcon NÃO está definido corretamente AQUI!");
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8">
      {/* O texto de teste que funcionou, pode remover se quiser */}
      <p style={{ position: 'fixed', top: '0', left: '0', backgroundColor: 'lime', color: 'black', padding: '5px', zIndex: 9999, fontSize: '10px' }}>
        DH com MenuIcon Correto
      </p>
      
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
        <div className="md:hidden order-2">
          <SidebarTrigger
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            {typeof MenuIcon === 'function' || typeof MenuIcon === 'object' ? <MenuIcon className="h-5 w-5" /> : <p style={{fontSize:'8px', color:'red'}}>M_ICON_FAIL</p>}
          </SidebarTrigger>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;