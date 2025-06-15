
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Scale, Shield } from 'lucide-react';

const MobileHeader: React.FC = () => {
  const { user } = useAuth();

  const getUserFirstName = () => {
    if (user?.user_metadata?.nome) {
      const fullName = user.user_metadata.nome;
      return fullName.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  if (!user) return null;

  return (
    <div className="md:hidden bg-gradient-to-r from-lawyer-primary via-blue-600 to-lawyer-dark shadow-lg">
      <div className="container mx-auto py-3 sm:py-4 px-3 sm:px-4">
        {/* Header Principal */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base sm:text-lg">JusGestão</h1>
              <p className="text-blue-100 text-xs">Sistema Jurídico Completo</p>
            </div>
          </div>
        </div>

        {/* Barra de Status do Usuário */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-400 animate-pulse"></div>
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                Bem-vindo, <span className="font-bold">{getUserFirstName()}</span>
              </p>
              <p className="text-blue-100 text-xs">
                Conectado e protegido
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
