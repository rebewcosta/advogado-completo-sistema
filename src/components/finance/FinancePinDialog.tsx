
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { KeyRound, Loader2 } from 'lucide-react';

interface FinancePinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (pin: string, rememberDevice?: boolean) => Promise<boolean>;
  isValidating: boolean;
}

export const FinancePinDialog: React.FC<FinancePinDialogProps> = ({
  isOpen,
  onClose,
  onValidate,
  isValidating,
}) => {
  const [pin, setPin] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);

  const handleSubmit = async () => {
    if (pin.length === 4) {
      const success = await onValidate(pin, rememberDevice);
      if (success) {
        setPin('');
        setRememberDevice(false);
        onClose();
      } else {
        setPin('');
      }
    }
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      setTimeout(() => handleSubmit(), 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-lawyer-primary" />
            PIN Financeiro
          </DialogTitle>
          <DialogDescription>
            Digite o PIN de 4 dígitos para visualizar os valores financeiros
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              disabled={isValidating}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <div className="flex items-center space-x-2 justify-center">
            <Checkbox
              id="remember-device"
              checked={rememberDevice}
              onCheckedChange={(checked) => setRememberDevice(checked === true)}
              disabled={isValidating}
            />
            <label htmlFor="remember-device" className="text-sm text-gray-600 cursor-pointer">
              Lembrar neste dispositivo
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={pin.length !== 4 || isValidating}
              className="flex-1"
            >
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
