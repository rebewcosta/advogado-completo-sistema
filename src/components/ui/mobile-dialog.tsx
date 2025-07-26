import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const MobileDialog: React.FC<MobileDialogProps> = ({
  open,
  onOpenChange,
  children,
  className
}) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open) {
      // Disable body scroll when dialog is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.bottom = '0';
    } else {
      // Re-enable body scroll when dialog is closed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog content */}
      <div 
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center p-0",
          isMobile ? "p-0" : "p-4"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={cn(
            "w-full bg-white shadow-lg",
            isMobile 
              ? "h-full max-h-[100dvh] overflow-hidden rounded-none" 
              : "max-w-2xl max-h-[95vh] rounded-xl",
            className
          )}
          style={{
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};