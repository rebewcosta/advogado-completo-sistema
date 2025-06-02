// src/components/shared/SharedPageHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Importa o SidebarTrigger corrigido
import { Menu as MenuIcon, Plus } from 'lucide-react'; // Renomeando Menu para MenuIcon para clareza
import { cn } from '@/lib/utils';

interface SharedPageHeaderProps {
  title: string;
  description: string;
  pageIcon: React.ReactNode;
  actionButtonText?: string;
  onActionButtonClick?: () => void;
  showActionButton?: boolean;
  actionButtonIcon?: React.ReactNode;
  isLoading?: boolean;
  actionButtonDisabled?: boolean;
}

const SharedPageHeader: React.FC<SharedPageHeaderProps> = ({
  title,
  description,
  pageIcon,
  actionButtonText,
  onActionButtonClick,
  showActionButton = true,
  actionButtonIcon,
  isLoading = false,
  actionButtonDisabled = false,
}) => {
  return (
    <>
      {/* Botão de Menu Hambúrguer Funcional e com Ênfase - Apenas Mobile */}
      <div className="md:hidden mb-4 flex justify-end">
        <SidebarTrigger
          variant="default" // Mudando para 'default' para usar cores primárias
          size="icon"
          className={cn(
            "h-10 w-10 text-white shadow-md", // Tamanho e sombra
            "bg-lawyer-primary hover:bg-lawyer-primary/90", // Cor de fundo primária e hover
            "focus-visible:ring-2 focus-visible:ring-lawyer-primary focus-visible:ring-offset-2" // Estilos de foco
          )}
        >
          <MenuIcon className="h-5 w-5" />
        </SidebarTrigger>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
        {/* Seção do Título e Ícone (ocupa espaço disponível) */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="text-lawyer-primary mr-3 flex-shrink-0">
            {React.cloneElement(pageIcon as React.ReactElement, { className: "h-7 w-7 md:h-8 md:w-8" })}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left truncate">{title}</h1>
            <div className="text-gray-600 text-left mt-1 text-sm md:text-base">
              <span className="block sm:inline">{description}</span>
            </div>
          </div>
        </div>

        {/* Seção de Botões (Apenas Ação Principal agora no mobile, o segundo menu foi removido) */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4 flex-shrink-0">
          {showActionButton && actionButtonText && onActionButtonClick && (
            <Button
              onClick={onActionButtonClick}
              className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white order-1 md:order-2 w-full sm:w-auto" // Botão de ação principal
              disabled={isLoading || actionButtonDisabled}
            >
              {actionButtonIcon ? actionButtonIcon : <Plus className="h-4 w-4 mr-2" />}
              {actionButtonText}
            </Button>
          )}
          {/* O segundo botão de menu mobile (SidebarTrigger) foi REMOVIDO daqui */}
        </div>
      </div>
    </>
  );
};

export default SharedPageHeader;