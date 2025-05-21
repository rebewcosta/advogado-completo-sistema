// src/pages/RedefinirPinFinanceiroPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, KeyRound, AlertTriangle } from 'lucide-react';

const RedefinirPinFinanceiroPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoadingVerification, setIsLoadingVerification] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      toast({ title: "Token Ausente", description: "Nenhum token de redefinição fornecido.", variant: "destructive" });
      setIsValidToken(false);
      setIsLoadingVerification(false);
      setErrorMessage("Link de redefinição inválido ou ausente.");
      return;
    }
    setToken(t);
    verifyToken(t);
  }, [searchParams, toast]);

  const verifyToken = async (tokenToVerify: string) => {
    setIsLoadingVerification(true);
    setErrorMessage('');
    try {
      const { data, error: funcError } = await supabase.functions.invoke('verify-finance-pin-reset-token', {
        body: { token: tokenToVerify }
      });

      if (funcError || (data && data.error)) {
        const errMsg = (data && data.error) || funcError?.message || "Erro ao verificar token.";
        throw new Error(errMsg);
      }

      if (data.valid) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        setErrorMessage(data.error || "Token inválido ou expirado.");
        toast({ title: "Token Inválido", description: data.error || "Este link de redefinição é inválido ou já expirou.", variant: "destructive" });
      }
    } catch (err: any) {
      setIsValidToken(false);
      setErrorMessage(err.message || "Ocorreu um erro ao verificar o link.");
      toast({ title: "Erro na Verificação", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingVerification(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPin.length !== 4) {
      setErrorMessage("O novo PIN deve ter 4 dígitos.");
      return;
    }
    if (newPin !== confirmNewPin) {
      setErrorMessage("Os PINs não coincidem.");
      return;
    }
    if (!token) {
      setErrorMessage("Token de redefinição não encontrado.");
      return;
    }

    setIsResetting(true);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('reset-finance-pin-with-token', {
        body: { token, newPin }
      });

      if (funcError || (data && data.error)) {
        const errMsg = (data && data.error) || funcError?.message || "Erro ao redefinir PIN.";
        throw new Error(errMsg);
      }

      setSuccessMessage(data.message || "PIN financeiro redefinido com sucesso!");
      toast({ title: "PIN Redefinido", description: "Seu PIN financeiro foi alterado." });
      setNewPin('');
      setConfirmNewPin('');
      setTimeout(() => {
        // Redirecionar para configurações ou login da área financeira
        navigate('/configuracoes'); // Ou para a página de login do financeiro
      }, 3000);

    } catch (err: any) {
      setErrorMessage(err.message || "Ocorreu um erro ao redefinir o PIN.");
      toast({ title: "Erro ao Redefinir", description: err.message, variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoadingVerification) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-lawyer-primary mb-4" />
        <p className="text-gray-600">Verificando link de redefinição...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle className="text-2xl text-red-600">Link Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-6">{errorMessage || "Este link de redefinição de PIN não é válido ou já expirou."}</p>
            <Button asChild>
              <Link to="/configuracoes">Voltar para Configurações</Link>
            </Button>
            <p className="text-xs text-gray-500 mt-4">Se o problema persistir, solicite um novo link ou contate o suporte.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-lawyer-primary mb-4" />
          <CardTitle className="text-2xl">Redefinir PIN Financeiro</CardTitle>
          <CardDescription>Crie um novo PIN de 4 dígitos para acessar a área Financeiro.</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">{successMessage}</p>
              <p className="text-sm text-gray-600">Você será redirecionado em breve...</p>
            </div>
          ) : (
            <form onSubmit={handleResetPin} className="space-y-6">
              <div>
                <Label htmlFor="newPin">Novo PIN (4 dígitos)</Label>
                <div className="flex justify-center mt-1">
                  <InputOTP maxLength={4} value={newPin} onChange={setNewPin} id="newPin" disabled={isResetting}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmNewPin">Confirmar Novo PIN</Label>
                 <div className="flex justify-center mt-1">
                  <InputOTP maxLength={4} value={confirmNewPin} onChange={setConfirmNewPin} id="confirmNewPin" disabled={isResetting}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}
              <Button type="submit" className="w-full" disabled={isResetting || newPin.length !== 4 || confirmNewPin.length !== 4}>
                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isResetting ? 'Redefinindo...' : 'Redefinir PIN'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RedefinirPinFinanceiroPage;