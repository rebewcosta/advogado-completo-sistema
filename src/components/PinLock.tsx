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
  pageName: string; // Recebe algo como "Financeiro_userId" para a chave do sessionStorage
  pinLength?: number;
}

const PinLock: React.FC<PinLockProps> = ({ onPinVerified, pageName, pinLength = 4 }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === pinLength) {
      handleSubmit(value);
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
    // A validação de comprimento é feita pelo botão de submit e pelo handlePinChange
    if (currentPin.length !== pinLength) {
        // Este caso não deve acontecer se o botão de submit estiver desabilitado
        // e handlePinChange chamar handleSubmit apenas com o comprimento correto.
        // Mas como uma salvaguarda:
        setError(`O PIN deve ter ${pinLength} dígitos.`);
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        const { data, error: funcError } = await supabase.functions.invoke('verify-finance-pin', {
            body: { pinAttempt: currentPin }, // Envia o PIN em texto plano
        });

        if (funcError) { // Erro na chamada da função (rede, CORS, etc.)
            console.error("Erro ao invocar verify-finance-pin (funcError):", funcError);
            const toastMessage = funcError.message.includes("Failed to fetch") || funcError.message.toLowerCase().includes("cors")
                ? "Falha de rede ou CORS. Verifique as configurações da Edge Function e sua conexão."
                : funcError.message || "Erro desconhecido ao verificar PIN.";
            throw new Error(toastMessage);
        }
        
        if (data && data.error) { // Erro retornado pela lógica interna da função
            console.error("Erro retornado pela função verify-finance-pin (data.error):", data.error);
            throw new Error(data.error);
        }

        if (data && data.verified === true) {
            sessionStorage.setItem(pageName, 'true');
            onPinVerified();
            toast({
                title: "Acesso Liberado",
                description: `Você acessou a página Financeiro.`,
            });
        } else {
            setError(data.message || 'PIN incorreto. Tente novamente.');
            setPin('');
            toast({
                title: "PIN Incorreto",
                description: data.message || "O PIN digitado está incorreto.",
                variant: "destructive",
            });
        }
    } catch (err: any) {
        console.error('Erro ao verificar PIN no PinLock (catch geral):', err);
        setError(err.message || 'Ocorreu um erro ao tentar verificar o PIN.');
        if (!err.message.includes("PIN incorreto")) { // Evita toast duplicado se o erro já foi tratado
            toast({
                title: "Erro na Verificação do PIN",
                description: err.message || 'Não foi possível verificar o PIN.',
                variant: "destructive",
            });
        }
        setPin('');
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
            Por favor, insira o PIN de {pinLength} dígitos para acessar a página Financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pin.length === pinLength) {
                handleSubmit(pin);
              }
            }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <InputOTP
                maxLength={pinLength}
                value={pin}
                onChange={handlePinChange}
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