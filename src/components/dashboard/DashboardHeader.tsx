
import React from 'react';
import { LogOut } from 'lucide-react';
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
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center">
        {user?.user_metadata?.logo && (
          <img 
            src={user.user_metadata.logo} 
            alt="Logo do Escritório" 
            className="h-12 w-auto mr-3 rounded-md" 
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-left">Dashboard</h1>
          <p className="text-sm text-gray-600 text-left">
            Bem-vindo(a), {getUserFirstName()}. Aqui está o resumo do seu escritório.
          </p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </div>
  );
};

export default DashboardHeader;
