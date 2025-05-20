// src/components/configuracoes/SegurancaTab.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client'; // Mantido para alteração de senha
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Spinner } from '@/components/ui/spinner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface SegurancaTabProps {
  securitySettings: {
    twoFactor: boolean;
    sessionTimeout: string;
    ipRestriction: boolean;
  };
  setSecuritySettings: React.Dispatch<React.SetStateAction<{
    twoFactor: boolean;
    sessionTimeout: string;
    ipRestriction: boolean;
  }>>;
  hasFinancePin: boolean; // Informa se um PIN financeiro já está configurado
  onChangeFinanceiroPin: (currentPin: string | null, newPin: string) => Promise<boolean>; // Função para alterar o PIN
  isSavingPin: boolean; // Estado de carregamento para a operação de PIN
}

const SegurancaTab = ({
  securitySettings,
  setSecuritySettings,
  hasFinancePin,
  onChangeFinanceiroPin,
  isSavingPin
}: SegurancaTabProps) => {
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [pinAtualFinanceiro, setPinAtualFinanceiro] = useState("");
  const [novoPinFinanceiro, setNovoPinFinanceiro] = useState("");
  const [confirmaNovoPinFinanceiro, setConfirmaNovoPinFinanceiro] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState("");

  const handleChangePassword = async () => { // ... (sem alterações, mas certifique-se de que está funcionando)
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Segurança</CardTitle>
        <CardDescription>
          Proteja sua conta e dados do escritório
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ... (seções existentes de 2FA, Senha, etc.) ... */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Autenticação em Dois Fatores</Label>
            <p className="text-sm text-muted-foreground">
              Adicione uma camada extra de segurança à sua conta (funcionalidade futura)
            </p>
          </div>
          <Switch
            checked={securitySettings.twoFactor}
            onCheckedChange={(checked) =>
              setSecuritySettings({...securitySettings, twoFactor: !!checked})
            }
            disabled // Desabilitado por enquanto
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Tempo de Sessão (minutos)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Defina por quanto tempo sua sessão permanecerá ativa sem atividade (funcionalidade futura)
          </p>
          <Input
            id="sessionTimeout"
            type="number"
            min="5"
            max="120"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
            disabled // Desabilitado por enquanto
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Restrição de IP</Label>
            <p className="text-sm text-muted-foreground">
              Limite o acesso a endereços IP específicos (funcionalidade futura)
            </p>
          </div>
          <Switch
            checked={securitySettings.ipRestriction}
            onCheckedChange={(checked) =>
              setSecuritySettings({...securitySettings, ipRestriction: !!checked})
            }
            disabled // Desabilitado por enquanto
          />
        </div>

        <Separator />

        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-lg font-medium">Alteração de Senha do Sistema</h3>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              name="newPassword" // Adicionado name para formulário
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword" // Adicionado name
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              required
            />
          </div>
          <Button
            type="submit" // Mudado para submit
            disabled={changingPassword}
          >
            {changingPassword ? (
              <><Spinner size="sm" className="mr-2" /> Alterando...</>
            ) : (
              'Alterar senha'
            )}
          </Button>
        </form>

        <Separator />

        <form onSubmit={handleAlterarPinFinanceiroSubmit} className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">PIN de Acesso ao Financeiro</h3>
          <p className="text-sm text-muted-foreground">
            {hasFinancePin ? "Altere seu PIN de 4 dígitos." : "Defina um PIN de 4 dígitos para a página Financeiro."}
          </p>

          {hasFinancePin && (
            <div className="space-y-2">
              <Label htmlFor="pinAtualFinanceiro">PIN Atual</Label>
              <InputOTP
                maxLength={4}
                value={pinAtualFinanceiro}
                onChange={(value) => setPinAtualFinanceiro(value)}
                name="pinAtualFinanceiro"
                id="pinAtualFinanceiro"
                containerClassName="justify-start"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} /> <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} /> <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="novoPinFinanceiro">Novo PIN (4 dígitos)</Label>
            <InputOTP
              maxLength={4}
              value={novoPinFinanceiro}
              onChange={(value) => setNovoPinFinanceiro(value)}
              name="novoPinFinanceiro"
              id="novoPinFinanceiro"
              containerClassName="justify-start"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} /> <InputOTPSlot index={1} />
                <InputOTPSlot index={2} /> <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmaNovoPinFinanceiro">Confirmar Novo PIN</Label>
            <InputOTP
              maxLength={4}
              value={confirmaNovoPinFinanceiro}
              onChange={(value) => setConfirmaNovoPinFinanceiro(value)}
              name="confirmaNovoPinFinanceiro"
              id="confirmaNovoPinFinanceiro"
              containerClassName="justify-start"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} /> <InputOTPSlot index={1} />
                <InputOTPSlot index={2} /> <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
            {pinErrorMessage && <p className="text-sm text-red-500">{pinErrorMessage}</p>}
          <Button
            type="submit"
            disabled={isSavingPin || (hasFinancePin && pinAtualFinanceiro.length !== 4) || novoPinFinanceiro.length !== 4 || confirmaNovoPinFinanceiro.length !== 4}
          >
            {isSavingPin ? (
              <><Spinner size="sm" className="mr-2" /> {hasFinancePin ? 'Alterando PIN...' : 'Definindo PIN...'}</>
            ) : (
              hasFinancePin ? 'Alterar PIN do Financeiro' : 'Definir PIN do Financeiro'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SegurancaTab;