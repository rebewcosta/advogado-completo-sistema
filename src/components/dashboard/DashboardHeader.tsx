// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogOut, LayoutDashboard, Menu as MenuIcon } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import OfficeInfoHeader from './OfficeInfoHeader';

interface DashboardHeaderProps {
  user: User | null;
  handleSignOut: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  handleSignOut
}) => {
  // Extrair dados do escritório dos metadados do usuário
  const officeData = {
    companyName: user?.user_metadata?.empresa || "",
    cnpj: user?.user_metadata?.cnpj || "",
    address: user?.user_metadata?.endereco || "", 
    website: user?.user_metadata?.website || "",
    phone: user?.user_metadata?.telefone || "",
    logo_url: user?.user_metadata?.logo_url || ""
  };

  return (
    <div>
      {/* Header do Dashboard com ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center flex-1 min-w-0">
          <LayoutDashboard className="h-7 w-7 sm:h-8 sm:w-8 text-lawyer-primary mr-2 sm:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left truncate">Dashboard</h1>
            <p className="text-sm text-gray-600 text-left">
              Visão geral do seu escritório de advocacia
            </p>
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
          {/* Botão do Menu Gaveta para Mobile */}
          <div className="md:hidden order-2">
            <SidebarTrigger
              variant="default"
              size="icon"
              className={cn(
                "h-8 w-8 text-white shadow-md",
                "bg-lawyer-primary hover:bg-lawyer-primary/90",
                "focus-visible:ring-2 focus-visible:ring-lawyer-primary focus-visible:ring-offset-2"
              )}
            >
              <MenuIcon className="h-5 w-5" /> 
            </SidebarTrigger>
          </div>
        </div>
      </div>

      {/* Informações do Escritório */}
      <OfficeInfoHeader officeData={officeData} />
    </div>
  );
};

export default DashboardHeader;