
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinancePinDialog } from './FinancePinDialog';
import { useFinanceVisibility } from '@/hooks/useFinanceVisibility';

interface FinanceValueToggleProps {
  value: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const FinanceValueToggle: React.FC<FinanceValueToggleProps> = ({
  value,
  formatValue = (val) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  className = "",
}) => {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const { isVisible, isValidating, validatePinAndToggle, hideValues } = useFinanceVisibility();

  const handleToggleVisibility = () => {
    if (isVisible) {
      hideValues();
    } else {
      setShowPinDialog(true);
    }
  };

  const handlePinValidation = async (pin: string) => {
    const success = await validatePinAndToggle(pin);
    return success;
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-bold">
          {isVisible ? formatValue(value) : "••••••"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleVisibility}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>

      <FinancePinDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onValidate={handlePinValidation}
        isValidating={isValidating}
      />
    </>
  );
};
