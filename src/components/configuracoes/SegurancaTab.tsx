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
import { Spinner, Loader2 } from '@/components/ui/spinner'; // Adicionado Loader2
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from '@/hooks/useAuth'; // Importar useAuth para pegar o token da sessão

interface SegurancaTabProps {
  // ... (props existentes)
  securitySettings: {
    // Mantido como estava, mesmo que alguns campos não sejam usados diretamente no formulário de PIN
    pref_seguranca_dois_fatores: boolean; // Renomeado para corresponder à ConfiguraçõesPage
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
  const { session } = useAuth(); // Pegar a sessão para o token JWT
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [pinAtualFinanceiro, setPinAtualFinanceiro] = useState("");
  const [novoPinFinanceiro, setNovoPinFinanceiro] = useState("");
  const [confirmaNovoPinFinanceiro, setConfirmaNovoPinFinanceiro] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState("");
  const [isRequestingPinReset, setIsRequestingPinReset] = useState(false); // Novo estado

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

  // Nova função para solicitar reset de PIN
  const handleRequestPinReset = async () => {
    if (!session) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado para solicitar a redefinição do PIN.", variant: "destructive" });
      return;
    }
    setIsRequestingPinReset(true);
    setPinErrorMessage(''); // Limpar erros anteriores
    try {
      const { data, error: funcError } = await supabase.functions.invoke('request-finance-pin-reset');

      if (funcError || (data && data.error)) {
        const errMsg = (data && data.error) || funcError?.message || "Erro ao solicitar redefinição.";
        throw new Error(errMsg);
      }
      
      toast({
        title: "Solicitação Enviada",
        description: data.message || "Se sua conta for encontrada, um email será enviado com instruções.",
        duration: 7000,
      });
      // console.log("DEBUG Link (remover em prod):", data.DEBUG_ONLY_link); // Para debug local

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
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Segurança</CardTitle>
        <CardDescription>
          Proteja sua conta e dados do escritório. Lembre-se de salvar todas as alterações no botão no topo da página.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção Autenticação em Dois Fatores */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="twoFactorSwitch">Autenticação em Dois Fatores</Label>
            <p className="text-sm text-muted-foreground">
              Adicione uma camada extra de segurança à sua conta (funcionalidade futura).
            </p>
          </div>
          <Switch
            id="twoFactorSwitch"
            checked={securitySettings.pref_seguranca_dois_fatores}
            onCheckedChange={(checked) =>
              setSecuritySettings(prev => ({...prev, pref_seguranca_dois_fatores: !!checked}))
            }
            disabled
          />
        </div>

        <Separator />

        {/* Seção Tempo de Sessão */}
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Tempo de Sessão (minutos)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Defina por quanto tempo sua sessão permanecerá ativa sem atividade (funcionalidade futura).
          </p>
          <Input
            id="sessionTimeout"
            type="number"
            min="5"
            max="120"
            value={securitySettings.pref_seguranca_tempo_sessao_min}
            onChange={(e) => setSecuritySettings(prev => ({...prev, pref_seguranca_tempo_sessao_min: e.target.value}))}
            disabled
          />
        </div>

        <Separator />

        {/* Seção Restrição de IP */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ipRestrictionSwitch">Restrição de IP</Label>
            <p className="text-sm text-muted-foreground">
              Limite o acesso a endereços IP específicos (funcionalidade futura).
            </p>
          </div>
          <Switch
            id="ipRestrictionSwitch"
            checked={securitySettings.pref_seguranca_restricao_ip}
            onCheckedChange={(checked) =>
              setSecuritySettings(prev => ({...prev, pref_seguranca_restricao_ip: !!checked}))
            }
            disabled
          />
        </div>

        <Separator />

        {/* Seção Alteração de Senha do Sistema */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-lg font-medium">Alteração de Senha do Sistema</h3>
          <div className="space-y-2">
            <Label htmlFor="newPassword_config">Nova senha</Label>
            <Input
              id="newPassword_config"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword_config">Confirmar nova senha</Label>
            <Input
              id="confirmPassword_config"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            disabled={changingPassword}
          >
            {changingPassword ? (
              <><Spinner size="sm" className="mr-2" /> Alterando...</>
            ) : (
              'Alterar senha do sistema'
            )}
          </Button>
        </form>

        <Separator />

        {/* Seção PIN de Acesso ao Financeiro */}
        <form onSubmit={handleAlterarPinFinanceiroSubmit} className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">PIN de Acesso ao Financeiro</h3>
          <p className="text-sm text-muted-foreground">
            {hasFinancePin ? "Altere seu PIN de 4 dígitos." : "Defina um PIN de 4 dígitos para a página Financeiro."}
          </p>

          {hasFinancePin && (
            <div className="space-y-2">
              <Label htmlFor="pinAtualFinanceiro_config">PIN Atual</Label>
              <InputOTP
                maxLength={4}
                value={pinAtualFinanceiro}
                onChange={(value) => setPinAtualFinanceiro(value)}
                name="pinAtualFinanceiro"
                id="pinAtualFinanceiro_config"
                containerClassName="justify-start"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="novoPinFinanceiro_config">Novo PIN (4 dígitos)</Label>
            <InputOTP
              maxLength={4}
              value={novoPinFinanceiro}
              onChange={(value) => setNovoPinFinanceiro(value)}
              name="novoPinFinanceiro"
              id="novoPinFinanceiro_config"
              containerClassName="justify-start"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmaNovoPinFinanceiro_config">Confirmar Novo PIN</Label>
            <InputOTP
              maxLength={4}
              value={confirmaNovoPinFinanceiro}
              onChange={(value) => setConfirmaNovoPinFinanceiro(value)}
              name="confirmaNovoPinFinanceiro"
              id="confirmaNovoPinFinanceiro_config"
              containerClassName="justify-start"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {pinErrorMessage && <p className="text-sm text-red-500 text-left">{pinErrorMessage}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button
                type="submit"
                disabled={isSavingPin || (hasFinancePin && pinAtualFinanceiro.length !== 4) || novoPinFinanceiro.length !== 4 || confirmaNovoPinFinanceiro.length !== 4}
            >
                {isSavingPin ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {hasFinancePin ? 'Alterando PIN...' : 'Definindo PIN...'}</>
                ) : (
                hasFinancePin ? 'Alterar PIN do Financeiro' : 'Definir PIN do Financeiro'
                )}
            </Button>
            {hasFinancePin && (
                 <Button
                    type="button"
                    variant="link"
                    className="text-sm text-blue-600 p-0 h-auto justify-start sm:ml-4"
                    onClick={handleRequestPinReset}
                    disabled={isRequestingPinReset}
                  >
                    {isRequestingPinReset ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando email...</> : "Esqueci meu PIN Financeiro"}
                  </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SegurancaTab;