
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, ShieldAlert } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface FinancePinFormProps {
  hasFinancePin: boolean;
  onChangeFinanceiroPin: (currentPin: string | null, newPin: string) => Promise<boolean>;
  isSavingPin: boolean;
}

const FinancePinForm = ({
  hasFinancePin,
  onChangeFinanceiroPin,
  isSavingPin
}: FinancePinFormProps) => {
  const { toast } = useToast();
  const { session, user } = useAuth();
  const [pinAtualFinanceiro, setPinAtualFinanceiro] = useState("");
  const [novoPinFinanceiro, setNovoPinFinanceiro] = useState("");
  const [confirmaNovoPinFinanceiro, setConfirmaNovoPinFinanceiro] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState("");
  const [isRequestingPinReset, setIsRequestingPinReset] = useState(false);

  const handleAlterarPinFinanceiroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMessage("");

    if (hasFinancePin && pinAtualFinanceiro.length !== 4) {
        setPinErrorMessage("PIN Atual deve ter 4 dígitos.");
        toast({ title: "PIN Atual Inválido", description: "O PIN atual deve ter 4 dígitos.", variant: "destructive" });
        return;
    }
    if (novoPinFinanceiro.length !== 4) {
        setPinErrorMessage("Novo PIN deve ter 4 dígitos.");
        toast({ title: "Novo PIN Inválido", description: "O novo PIN deve ter 4 dígitos.", variant: "destructive" });
        return;
    }
    if (novoPinFinanceiro !== confirmaNovoPinFinanceiro) {
        setPinErrorMessage("O novo PIN e a confirmação não coincidem.");
        toast({ title: "Confirmação de PIN Falhou", description: "O novo PIN e a confirmação não coincidem.", variant: "destructive" });
        return;
    }

    const success = await onChangeFinanceiroPin(hasFinancePin ? pinAtualFinanceiro : null, novoPinFinanceiro);
    if (success) {
      setPinAtualFinanceiro("");
      setNovoPinFinanceiro("");
      setConfirmaNovoPinFinanceiro("");
      setPinErrorMessage("");
    }
  };

  const handleRequestPinReset = async () => {
    if (!session || !user) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado para solicitar a redefinição do PIN.", variant: "destructive" });
      return;
    }
    setIsRequestingPinReset(true);
    setPinErrorMessage('');
    try {
      const { data, error: funcError } = await supabase.functions.invoke('request-finance-pin-reset');

      if (funcError || (data && data.error)) {
        const errMsg = (data && data.error) || funcError?.message || "Erro ao solicitar redefinição.";
        throw new Error(errMsg);
      }
      
      toast({
        title: "Solicitação Enviada",
        description: data.message || `Um email com instruções foi enviado para ${user.email}.`,
        duration: 7000,
      });

    } catch (err: any) {
      toast({
        title: "Erro na Solicitação",
        description: err.message || "Não foi possível processar sua solicitação de redefinição de PIN.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingPinReset(false);
    }
  };

  return (
    <div className="p-4 md:p-5 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50">
        <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-5 w-5 text-lawyer-primary" />
            <h3 className="text-lg font-medium text-gray-700">PIN de Acesso ao Financeiro</h3>
        </div>
      <p className="text-xs text-gray-500 mb-4">
        {hasFinancePin ? "Altere seu PIN de 4 dígitos para acesso à área Financeiro." : "Defina um PIN de 4 dígitos para proteger o acesso à área Financeiro."}
      </p>
      <form onSubmit={handleAlterarPinFinanceiroSubmit} className="space-y-4">
        {hasFinancePin && (
          <div className="space-y-1.5">
            <Label htmlFor="pinAtualFinanceiro_config_sec" className="text-sm font-medium text-gray-700">PIN Atual</Label>
            <div className="flex justify-start">
                <InputOTP
                maxLength={4}
                value={pinAtualFinanceiro}
                onChange={(value) => setPinAtualFinanceiro(value)}
                name="pinAtualFinanceiro"
                id="pinAtualFinanceiro_config_sec"
                containerClassName="justify-start"
                >
                <InputOTPGroup>
                    <InputOTPSlot index={0} /> <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} /> <InputOTPSlot index={3} />
                </InputOTPGroup>
                </InputOTP>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
            <Label htmlFor="novoPinFinanceiro_config_sec" className="text-sm font-medium text-gray-700">Novo PIN (4 dígitos)</Label>
            <InputOTP
                maxLength={4}
                value={novoPinFinanceiro}
                onChange={(value) => setNovoPinFinanceiro(value)}
                name="novoPinFinanceiro"
                id="novoPinFinanceiro_config_sec"
                containerClassName="justify-start"
            >
                <InputOTPGroup>
                <InputOTPSlot index={0} /> <InputOTPSlot index={1} />
                <InputOTPSlot index={2} /> <InputOTPSlot index={3} />
                </InputOTPGroup>
            </InputOTP>
            </div>

            <div className="space-y-1.5">
            <Label htmlFor="confirmaNovoPinFinanceiro_config_sec" className="text-sm font-medium text-gray-700">Confirmar Novo PIN</Label>
            <InputOTP
                maxLength={4}
                value={confirmaNovoPinFinanceiro}
                onChange={(value) => setConfirmaNovoPinFinanceiro(value)}
                name="confirmaNovoPinFinanceiro"
                id="confirmaNovoPinFinanceiro_config_sec"
                containerClassName="justify-start"
            >
                <InputOTPGroup>
                <InputOTPSlot index={0} /> <InputOTPSlot index={1} />
                <InputOTPSlot index={2} /> <InputOTPSlot index={3} />
                </InputOTPGroup>
            </InputOTP>
            </div>
        </div>
        {pinErrorMessage && <Alert variant="destructive" className="p-2 text-xs"><ShieldAlert className="h-4 w-4" /><AlertDescription>{pinErrorMessage}</AlertDescription></Alert>}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          <Button
              type="submit"
              disabled={isSavingPin || (hasFinancePin && pinAtualFinanceiro.length !== 4) || novoPinFinanceiro.length !== 4 || confirmaNovoPinFinanceiro.length !== 4}
              className="w-full sm:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
              size="sm"
          >
              {isSavingPin ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {hasFinancePin ? 'Alterando PIN...' : 'Definindo PIN...'}</>
              ) : (
              hasFinancePin ? 'Alterar PIN Financeiro' : 'Definir PIN Financeiro'
              )}
          </Button>
          {hasFinancePin && (
               <Button
                  type="button"
                  variant="link"
                  className="text-xs sm:text-sm text-blue-600 p-0 h-auto justify-start hover:underline sm:ml-2"
                  onClick={handleRequestPinReset}
                  disabled={isRequestingPinReset}
                >
                  {isRequestingPinReset ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Enviando email...</> : "Esqueci meu PIN Financeiro"}
                </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FinancePinForm;
