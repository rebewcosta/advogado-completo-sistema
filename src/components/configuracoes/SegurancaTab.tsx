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
import { Loader2, KeyRound, ShieldAlert } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from '@/hooks/useAuth';

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
  const { session, user } = useAuth(); // Adicionado user
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [pinAtualFinanceiro, setPinAtualFinanceiro] = useState("");
  const [novoPinFinanceiro, setNovoPinFinanceiro] = useState("");
  const [confirmaNovoPinFinanceiro, setConfirmaNovoPinFinanceiro] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState("");
  const [isRequestingPinReset, setIsRequestingPinReset] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      setPasswordData({ newPassword: "", confirmPassword: "" });
      toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro ao alterar senha", description: error.message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
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
    if (!session || !user) { // Adicionado !user
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
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Segurança da Conta</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Proteja sua conta, altere sua senha e gerencie o PIN de acesso financeiro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Seção de Alteração de Senha do Sistema */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-1">Alterar Senha do Sistema</h3>
          <p className="text-xs text-gray-500 mb-4">Use uma senha forte para maior segurança.</p>
          <form onSubmit={handleChangePassword} className="space-y-4">
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
            <Button
              type="submit"
              disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
            >
              {changingPassword ? (
                <><Spinner size="sm" className="mr-2" /> Alterando...</>
              ) : (
                'Alterar Senha do Sistema'
              )}
            </Button>
          </form>
        </div>

        {/* Seção de PIN Financeiro */}
        <div className="p-4 border border-gray-200 rounded-md">
            <div className="flex items-center gap-2 mb-1">
                <KeyRound className="h-5 w-5 text-lawyer-primary" />
                <h3 className="text-lg font-medium text-gray-700">PIN de Acesso ao Financeiro</h3>
            </div>
          <p className="text-xs text-gray-500 mb-4">
            {hasFinancePin ? "Altere seu PIN de 4 dígitos." : "Defina um PIN de 4 dígitos para proteger o acesso à área Financeiro."}
          </p>
          <form onSubmit={handleAlterarPinFinanceiroSubmit} className="space-y-4">
            {hasFinancePin && (
              <div className="space-y-1.5">
                <Label htmlFor="pinAtualFinanceiro_config_sec" className="text-sm font-medium text-gray-700">PIN Atual</Label>
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
            )}

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
            {pinErrorMessage && <p className="text-sm text-red-500 text-left flex items-center"><ShieldAlert className="h-4 w-4 mr-1 text-red-500"/>{pinErrorMessage}</p>}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <Button
                  type="submit"
                  disabled={isSavingPin || (hasFinancePin && pinAtualFinanceiro.length !== 4) || novoPinFinanceiro.length !== 4 || confirmaNovoPinFinanceiro.length !== 4}
                  className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
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
                      className="text-xs sm:text-sm text-blue-600 p-0 h-auto justify-start sm:ml-4 hover:underline"
                      onClick={handleRequestPinReset}
                      disabled={isRequestingPinReset}
                    >
                      {isRequestingPinReset ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Enviando...</> : "Esqueci meu PIN Financeiro"}
                    </Button>
              )}
            </div>
          </form>
        </div>
        
        {/* Funcionalidades futuras desabilitadas */}
        <Separator className="my-6" />
        <div className="space-y-6 opacity-50">
            <h3 className="text-lg font-medium text-gray-500">Configurações Avançadas (Em Breve)</h3>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
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

            <div className="space-y-1.5 p-4 border border-gray-200 rounded-md">
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
                className="border-gray-300"
            />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
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

      </CardContent>
    </Card>
  );
};

export default SegurancaTab;