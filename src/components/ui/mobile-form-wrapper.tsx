import React from 'react';
import { cn } from '@/lib/utils';

interface MobileFormWrapperProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileFormHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileFormContentProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileFormFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFormWrapper: React.FC<MobileFormWrapperProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col h-full max-h-[100dvh] overflow-hidden",
      "touch-pan-y", // Enable vertical touch scrolling
      className
    )}>
      {children}
    </div>
  );
};

export const MobileFormHeader: React.FC<MobileFormHeaderProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "flex-shrink-0 p-4 sm:p-6",
      className
    )}>
      {children}
    </div>
  );
};

export const MobileFormContent: React.FC<MobileFormContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex-1 bg-white mx-4 sm:mx-6 rounded-xl",
        "min-h-0", // Important for flex child to allow scrolling
        "overflow-y-scroll overflow-x-hidden", // Use scroll instead of auto
        "[&::-webkit-scrollbar]:hidden", // Hide scrollbar
        className
      )}
      style={{
        WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
        touchAction: 'pan-y', // Enable only vertical touch panning
        overscrollBehavior: 'contain', // Prevent scroll chaining
        scrollbarWidth: 'none', // Hide scrollbar on Firefox
        msOverflowStyle: 'none' // Hide scrollbar on IE/Edge
      }}
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8">
        {children}
      </div>
    </div>
  );
};

export const MobileFormFooter: React.FC<MobileFormFooterProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "flex-shrink-0 p-4 sm:p-6 pb-4 sm:pb-6",
      "safe-area-inset-bottom", // iOS safe area
      className
    )}>
      {children}
    </div>
  );
};