import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface MobileFormWrapperProps {
  children: React.ReactNode;
  title: string;
  onBack: () => void;
  footer: React.ReactNode;
}

const MobileFormWrapper: React.FC<MobileFormWrapperProps> = ({
  children,
  title,
  onBack,
  footer,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex h-full w-full flex-col bg-background p-4">
      {/* Cabeçalho */}
      <div className="mb-4 flex flex-shrink-0 items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {/* Área de Conteúdo (Campos do Formulário) - Agora Rolável */}
      <div className="flex-grow overflow-y-auto pb-4">{children}</div>

      {/* Rodapé (Botões de Ação) */}
      <div className="flex-shrink-0 border-t pt-4">{footer}</div>
    </div>
  );
};

export default MobileFormWrapper;