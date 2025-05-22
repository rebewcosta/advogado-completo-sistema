// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogOut, LayoutDashboard } from 'lucide-react'; // Importado LayoutDashboard
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

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
      <div className="flex items-center mb-4 sm:mb-0">
        {/* Ícone adicionado aqui */}
        <LayoutDashboard className="h-7 w-7 sm:h-8 sm:w-8 text-lawyer-primary mr-3" />
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
        className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 self-start sm:self-center"
      >
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </div>
  );
};

export default DashboardHeader;