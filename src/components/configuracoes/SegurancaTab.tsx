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
import { Spinner } from '@/components/ui/spinner'; // Mantido caso use em outro lugar

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
}

const SegurancaTab = ({ securitySettings, setSecuritySettings }: SegurancaTabProps) => {
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", // Você pode querer remover este se não estiver usando para validar
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!passwordData.newPassword) { // Removida verificação de currentPassword se não for usada
      toast({
        title: "Campo obrigatório",
        description: "Digite sua nova senha.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Atualizar senha usando a API do Supabase
      // A API updateUser do Supabase para senha não requer a senha antiga se o usuário já estiver autenticado.
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao tentar alterar sua senha.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
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
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Autenticação em Dois Fatores</Label>
            <p className="text-sm text-muted-foreground">
              Adicione uma camada extra de segurança à sua conta
            </p>
          </div>
          <Switch 
            checked={securitySettings.twoFactor}
            onCheckedChange={(checked) => 
              setSecuritySettings({...securitySettings, twoFactor: !!checked}) // Garantir boolean
            }
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Tempo de Sessão (minutos)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Defina por quanto tempo sua sessão permanecerá ativa sem atividade
          </p>
          <Input 
            id="sessionTimeout"
            type="number"
            min="5"
            max="120"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Restrição de IP</Label>
            <p className="text-sm text-muted-foreground">
              Limite o acesso a endereços IP específicos
            </p>
          </div>
          <Switch 
            checked={securitySettings.ipRestriction}
            onCheckedChange={(checked) => 
              setSecuritySettings({...securitySettings, ipRestriction: !!checked}) // Garantir boolean
            }
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Alteração de Senha do Sistema</h3>
          
          {/* O campo "Senha atual" foi mantido, mas você pode removê-lo se a lógica de validação não for necessária/implementada */}
          {/* <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input 
              id="currentPassword" 
              type="password" 
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            />
          </div>
          */}
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input 
              id="newPassword" 
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            />
          </div>
          
          <Button 
            onClick={handleChangePassword} 
            disabled={changingPassword}
          >
            {changingPassword ? (
              <>
                <Spinner size="sm" className="mr-2" /> {/* Usando Spinner importado */}
                Alterando...
              </>
            ) : (
              'Alterar senha'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SegurancaTab;