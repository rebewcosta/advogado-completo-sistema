
// src/components/configuracoes/SegurancaTab.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Spinner } from '@/components/ui/spinner';
import { Loader2, KeyRound, ShieldAlert, Lock, ShieldCheck, Info, Mail } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SegurancaTabProps {
  securitySettings: {
    pref_seguranca_dois_fatores: boolean;
    pref_seguranca_tempo_sessao_min: string;
    pref_seguranca_restricao_ip: boolean;
  };
  setSecuritySettings: React.Dispatch<React.SetStateAction<{
    pref_seguranca_dois_fatores: boolean;
    pref_seguranca_tempo_sessao_min: string;
    pref_seguranca_restricao_ip: boolean;
  }>>;
  hasFinancePin: boolean;
  onChangeFinanceiroPin: (currentPin: string | null, newPin: string) => Promise<boolean>;
  isSavingPin: boolean;
}

const SegurancaTab = ({
  securitySettings,
  setSecuritySettings,
  hasFinancePin,
  onChangeFinanceiroPin,
  isSavingPin
}: SegurancaTabProps) => {
  const { toast } = useToast();
  const { session, user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);

  const [pinAtualFinanceiro, setPinAtualFinanceiro] = useState("");
  const [novoPinFinanceiro, setNovoPinFinanceiro] = useState("");
  const [confirmaNovoPinFinanceiro, setConfirmaNovoPinFinanceiro] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState("");
  const [isRequestingPinReset, setIsRequestingPinReset] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMessage('');
    
    if (!passwordData.currentPassword) {
      toast({ title: "Campo obrigatório", description: "Digite sua senha atual.", variant: "destructive" });
      return;
    }
    if (!passwordData.newPassword) {
      toast({ title: "Campo obrigatório", description: "Digite sua nova senha.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Senhas não conferem", description: "A nova senha e a confirmação devem ser iguais.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      // Primeiro verificar se a senha atual está correta
      const { data: isCurrentPasswordValid, error: verifyError } = await supabase.rpc('verify_current_password', {
        current_password: passwordData.currentPassword
      });

      if (verifyError) {
        throw new Error("Erro ao verificar senha atual.");
      }

      if (!isCurrentPasswordValid) {
        toast({ 
          title: "Senha atual incorreta", 
          description: "A senha atual fornecida está incorreta.", 
          variant: "destructive" 
        });
        return;
      }

      // Se a senha atual está correta, atualizar para a nova senha
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso." });
    } catch (error: any) {
      toast({ 
        title: "Erro ao alterar senha", 
        description: error.message || "Ocorreu um erro.", 
        variant: "destructive" 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({ 
        title: "Email não encontrado", 
        description: "Não foi possível encontrar seu email.", 
        variant: "destructive" 
      });
      return;
    }

    setSendingPasswordReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/atualizar-senha`
      });

      if (error) throw error;

      toast({
        title: "Email de recuperação enviado",
        description: `Um email com instruções para redefinir sua senha foi enviado para ${user.email}. Verifique sua caixa de entrada e spam.`,
        duration: 8000,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setSendingPasswordReset(false);
    }
  };

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
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <ShieldCheck className="mr-2 h-6 w-6 text-lawyer-primary" />
          Segurança da Conta
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 pt-1">
          Gerencie suas senhas, PIN de acesso e outras configurações de segurança.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">

        {/* Seção de Alteração de Senha do Sistema */}
        <div className="p-4 md:p-5 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-lawyer-primary" />
            <h3 className="text-lg font-medium text-gray-700">Alterar Senha do Sistema</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Use uma senha forte e única para proteger sua conta principal.</p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword_config_sec" className="text-sm font-medium text-gray-700">Senha atual</Label>
              <Input
                id="currentPassword_config_sec"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
                className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                <Label htmlFor="newPassword_config_sec" className="text-sm font-medium text-gray-700">Nova senha</Label>
                <Input
                    id="newPassword_config_sec"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                    minLength={6}
                    className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
                    placeholder="Mínimo 6 caracteres"
                />
                </div>
                <div className="space-y-1.5">
                <Label htmlFor="confirmPassword_config_sec" className="text-sm font-medium text-gray-700">Confirmar nova senha</Label>
                <Input
                    id="confirmPassword_config_sec"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                    minLength={6}
                    className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
                />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full sm:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
                size="sm"
              >
                {changingPassword ? (
                  <><Spinner size="sm" className="mr-2 border-white/50 border-t-white" /> Alterando...</>
                ) : (
                  'Alterar Senha do Sistema'
                )}
              </Button>
              <Button
                type="button"
                variant="link"
                className="text-xs sm:text-sm text-blue-600 p-0 h-auto justify-start hover:underline sm:ml-2"
                onClick={handlePasswordReset}
                disabled={sendingPasswordReset}
              >
                {sendingPasswordReset ? (
                  <><Mail className="mr-1 h-3 w-3 animate-pulse" /> Enviando email...</>
                ) : (
                  <>
                    <Mail className="mr-1 h-3 w-3" />
                    Esqueci minha senha
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Seção de PIN Financeiro */}
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
        
        {/* Funcionalidades futuras desabilitadas */}
        <div className="opacity-60 pointer-events-none">
            <Separator className="my-6" />
            <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-500">Configurações Avançadas (Em Breve)</h3>
            </div>
            <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="space-y-0.5">
                    <Label htmlFor="twoFactorSwitch_config_sec" className="font-medium text-gray-600">Autenticação em Dois Fatores</Label>
                    <p className="text-xs text-gray-500">
                    Adicione uma camada extra de segurança à sua conta.
                    </p>
                </div>
                <Switch
                    id="twoFactorSwitch_config_sec"
                    checked={securitySettings.pref_seguranca_dois_fatores}
                    onCheckedChange={(checked) =>
                    setSecuritySettings(prev => ({...prev, pref_seguranca_dois_fatores: !!checked}))
                    }
                    disabled
                />
                </div>

                <div className="space-y-1.5 p-4 border border-gray-200 rounded-md bg-gray-50">
                <Label htmlFor="sessionTimeout_config_sec" className="text-sm font-medium text-gray-600">Tempo de Sessão (minutos)</Label>
                <p className="text-xs text-gray-500 mb-2">
                    Defina por quanto tempo sua sessão permanecerá ativa sem atividade.
                </p>
                <Input
                    id="sessionTimeout_config_sec"
                    type="number"
                    min="5"
                    max="120"
                    value={securitySettings.pref_seguranca_tempo_sessao_min}
                    onChange={(e) => setSecuritySettings(prev => ({...prev, pref_seguranca_tempo_sessao_min: e.target.value}))}
                    disabled
                    className="border-gray-300 w-24"
                />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="space-y-0.5">
                    <Label htmlFor="ipRestrictionSwitch_config_sec" className="font-medium text-gray-600">Restrição de IP</Label>
                    <p className="text-xs text-gray-500">
                    Limite o acesso a endereços IP específicos.
                    </p>
                </div>
                <Switch
                    id="ipRestrictionSwitch_config_sec"
                    checked={securitySettings.pref_seguranca_restricao_ip}
                    onCheckedChange={(checked) =>
                    setSecuritySettings(prev => ({...prev, pref_seguranca_restricao_ip: !!checked}))
                    }
                    disabled
                />
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default SegurancaTab;
