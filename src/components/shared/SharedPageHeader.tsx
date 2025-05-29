// src/components/shared/SharedPageHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button'; // Manter para o botão de ação principal
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Menu as MenuIcon, Plus } from 'lucide-react';
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
      <div className="flex items-center w-full md:w-auto">
        <div className="md:hidden mr-2">
          <SidebarTrigger 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <MenuIcon className="h-5 w-5" />
          </SidebarTrigger>
        </div>
        <div className="text-lawyer-primary mr-3 flex-shrink-0">
          {React.cloneElement(pageIcon as React.ReactElement, { className: "h-7 w-7 md:h-8 md:w-8" })}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left">{title}</h1>
          <p className="text-gray-600 text-left mt-1 text-sm md:text-base">{description}</p>
        </div>
      </div>
      {showActionButton && actionButtonText && onActionButtonClick && (
        <Button
          onClick={onActionButtonClick}
          className="mt-4 md:mt-0 w-full md:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
          disabled={isLoading || actionButtonDisabled}
        >
          {actionButtonIcon ? actionButtonIcon : <Plus className="h-4 w-4 mr-2" />}
          {actionButtonText}
        </Button>
      )}
    </div>
  );
};

export default SharedPageHeader;