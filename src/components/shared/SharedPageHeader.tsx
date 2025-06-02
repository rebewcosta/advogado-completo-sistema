// src/components/shared/SharedPageHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
// GARANTIR QUE ESTA IMPORTAÇÃO ESTÁ CORRETA E SENDO USADA:
import { Menu as MenuIcon, Plus } from 'lucide-react'; 
import { cn } from '@/lib/utils';

// Log para verificar a importação
console.log("SharedPageHeader.tsx: MenuIcon importado:", typeof MenuIcon, MenuIcon);


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
  if (typeof MenuIcon !== 'function' && typeof MenuIcon !== 'object') {
    console.error("SharedPageHeader.tsx: MenuIcon NÃO está definido corretamente AQUI!");
  }
  return (
    <>
      {/* Este primeiro SidebarTrigger é o que você queria funcional */}
      <div className="md:hidden mb-4 flex justify-end">
        <SidebarTrigger
          variant="outline"
          size="icon"
          className="h-10 w-10 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          {typeof MenuIcon === 'function' || typeof MenuIcon === 'object' ? <MenuIcon className="h-5 w-5" /> : <p style={{fontSize:'8px', color:'red'}}>SPH_M_ICON1_FAIL</p>}
        </SidebarTrigger>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
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

        <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4 flex-shrink-0">
          {showActionButton && actionButtonText && onActionButtonClick && (
            <Button
              onClick={onActionButtonClick}
              className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white order-1 md:order-2 w-full sm:w-auto"
              disabled={isLoading || actionButtonDisabled}
            >
              {actionButtonIcon ? actionButtonIcon : <Plus className="h-4 w-4 mr-2" />}
              {actionButtonText}
            </Button>
          )}
          <div className="md:hidden order-2 md:order-1">
            <SidebarTrigger
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {typeof MenuIcon === 'function' || typeof MenuIcon === 'object' ? <MenuIcon className="h-5 w-5" /> : <p style={{fontSize:'8px', color:'red'}}>SPH_M_ICON2_FAIL</p>}
            </SidebarTrigger>
          </div>
        </div>
      </div>
    </>
  );
};

export default SharedPageHeader;