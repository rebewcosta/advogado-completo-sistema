// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogOut, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = getUserFirstName();
  const officeName = user?.user_metadata?.empresa || "seu Escritório"; // Default text ajustado
  const userLogo = user?.user_metadata?.logo_url as string | undefined;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 md:gap-4 mb-4 sm:mb-0">
        {userLogo ? (
          <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-gray-200 dark:border-gray-600">
            <AvatarImage src={userLogo} alt="Logo do Escritório" />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
              {getInitials(officeName || displayName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Building className="h-6 w-6 text-lawyer-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Olá, {displayName}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bem-vindo(a) ao painel de {officeName}.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-400/50 dark:hover:border-red-400 self-start sm:self-center"
      >
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </div>
  );
};

export default DashboardHeader;