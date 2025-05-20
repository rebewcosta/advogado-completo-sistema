// src/components/PinLock.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PinLockProps {
  onPinVerified: () => void;
  pageName: string;
  pinLength?: number;
}

// REMOVA A FUNÇÃO simpleClientHash DESTE ARQUIVO
// const simpleClientHash = async (text: string): Promise<string> => { ... };

const PinLock: React.FC<PinLockProps> = ({ onPinVerified, pageName, pinLength = 4 }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === pinLength) {
      handleSubmit(value); // Chama handleSubmit quando o PIN atinge o comprimento correto
    }
    if (error) setError('');
  };

  const handleSubmit = async (currentPin: string) => {
    if (!session) {
        setError('Sessão de usuário não encontrada. Faça login novamente.');
        toast({ title: "Erro de Autenticação", description: "Sua sessão expirou ou não foi encontrada.", variant: "destructive"});
        setIsLoading(false);
        return;
    }
     if (currentPin.length !== pinLength) {
        // Esta verificação pode ser redundante se handleSubmit só é chamado quando o comprimento é correto
        // setError(`O PIN deve ter ${pinLength} dígitos.`);
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        // Envia o PIN em texto plano para a Edge Function
        const { data, error: funcError } = await supabase.functions.invoke('verify-finance-pin', {
            body: { pinAttempt: currentPin }, // Alterado de pinAttemptHash para pinAttempt
        });

        if (funcError || (data && data.error)) {
            const errorMessage = (data && data.error) || funcError?.message || `Erro ao verificar PIN.`;
            throw new Error(errorMessage);
        }

        if (data && data.verified === true) {
            sessionStorage.setItem(`pinVerified_${pageName}`, 'true');
            onPinVerified();
            toast({
                title: "Acesso Liberado",
                description: `Você acessou a página ${pageName}.`,
            });
        } else {
            setError(data.message || 'PIN incorreto. Tente novamente.');
            setPin(''); // Limpa o campo
            toast({
                title: "PIN Incorreto",
                description: data.message || "O PIN digitado está incorreto.",
                variant: "destructive",
            });
        }
    } catch (err: any) {
        console.error('Erro ao verificar PIN:', err);
        setError(err.message || 'Ocorreu um erro ao tentar verificar o PIN.');
        toast({
            title: "Erro na Verificação",
            description: err.message || 'Não foi possível verificar o PIN.',
            variant: "destructive",
        });
        setPin(''); // Limpa o campo
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-lawyer-primary mb-4" />
          <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
          <CardDescription>
            Por favor, insira o PIN de {pinLength} dígitos para acessar a página {pageName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(pin);
            }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <InputOTP
                maxLength={pinLength}
                value={pin}
                onChange={handlePinChange} // handlePinChange agora também chama handleSubmit
                disabled={isLoading}
              >
                <InputOTPGroup>
                  {Array.from({ length: pinLength }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 mr-1" /> {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || pin.length !== pinLength}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Verificando...' : 'Desbloquear'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinLock;