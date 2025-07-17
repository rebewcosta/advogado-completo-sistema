
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PasswordChangeForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);

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
      // Atualizar diretamente para a nova senha usando o Supabase Auth
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

  return (
    <div className="p-4 md:p-5 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="h-5 w-5 text-lawyer-primary" />
        <h3 className="text-lg font-medium text-gray-700">Alterar Senha do Sistema</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">Digite uma nova senha segura. O Supabase irá confirmar sua identidade automaticamente.</p>
      <form onSubmit={handleChangePassword} className="space-y-4">
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
            disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
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
  );
};

export default PasswordChangeForm;
