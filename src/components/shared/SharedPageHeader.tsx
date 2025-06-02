
// src/components/shared/SharedPageHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Menu, Plus } from 'lucide-react';
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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
      {/* Seção do Título e Ícone (ocupa espaço disponível) */}
      <div className="flex items-center flex-1 min-w-0"> {/* flex-1 para ocupar espaço */}
        <div className="text-lawyer-primary mr-3 flex-shrink-0">
          {React.cloneElement(pageIcon as React.ReactElement, { className: "h-7 w-7 md:h-8 md:w-8" })}
        </div>
        <div className="min-w-0"> {/* Para truncar texto se necessário */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left truncate">{title}</h1>
          <div className="text-gray-600 text-left mt-1 text-sm md:text-base">
            <span className="block sm:inline">{description}</span>
          </div>
        </div>
      </div>

      {/* Seção de Botões (Ação Principal e Menu Mobile) */}
      <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4 flex-shrink-0"> {/* md:ml-4 para espaço no desktop */}
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
        {/* Botão do Menu Gaveta para Mobile - Agora à direita */}
        <div className="md:hidden order-2 md:order-1"> {/* Visível apenas abaixo de md e define ordem */}
          <SidebarTrigger className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 p-1 rounded-md">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </div>
    </div>
  );
};

export default SharedPageHeader;
