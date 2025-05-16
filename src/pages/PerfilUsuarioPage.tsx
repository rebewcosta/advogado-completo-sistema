
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';
import { Spinner } from '@/components/ui/spinner';
import { User, Settings, CreditCard, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';

const PerfilUsuarioPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [searchParams] = useSearchParams();
  const [notificacoes, setNotificacoes] = useState({
    emailNovosProcessos: true,
    emailAudiencias: true,
    emailPrazos: true,
    smsAudiencias: false,
    smsVencimentos: false
  });
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get the active tab from URL or default to "perfil"
  const activeTab = searchParams.get('tab') || 'perfil';

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setNome(user.user_metadata?.nome || '');
      
      // Se existirem configurações de notificações nos metadados do usuário
      if (user.user_metadata?.notificacoes) {
        setNotificacoes(user.user_metadata.notificacoes);
      }
    }
  }, [user]);

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { nome }
      });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSalvarNotificacoes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          notificacoes: notificacoes
        }
      });

      if (error) throw error;

      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar preferências",
        description: error.message || "Ocorreu um erro ao atualizar suas preferências.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggleNotificacao = (key: keyof typeof notificacoes) => {
    setNotificacoes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
          <p className="text-gray-500">Gerencie suas informações e preferências</p>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="assinatura" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Assinatura
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notificações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSalvarPerfil} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      readOnly
                    />
                    <p className="text-sm text-gray-500">O email não pode ser alterado</p>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar alterações'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assinatura">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Assinatura</CardTitle>
                <CardDescription>
                  Visualize e gerencie sua assinatura atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GerenciarAssinatura />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificações</CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSalvarNotificacoes} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Notificações por Email</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-processos" className="font-medium">Novos processos</Label>
                          <p className="text-sm text-gray-500">Receba um email quando novos processos forem adicionados</p>
                        </div>
                        <Switch 
                          id="email-processos" 
                          checked={notificacoes.emailNovosProcessos}
                          onCheckedChange={() => handleToggleNotificacao('emailNovosProcessos')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-audiencias" className="font-medium">Audiências</Label>
                          <p className="text-sm text-gray-500">Receba um email lembrando de audiências marcadas</p>
                        </div>
                        <Switch 
                          id="email-audiencias" 
                          checked={notificacoes.emailAudiencias}
                          onCheckedChange={() => handleToggleNotificacao('emailAudiencias')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-prazos" className="font-medium">Prazos processuais</Label>
                          <p className="text-sm text-gray-500">Receba um email quando houver prazos a vencer</p>
                        </div>
                        <Switch 
                          id="email-prazos" 
                          checked={notificacoes.emailPrazos}
                          onCheckedChange={() => handleToggleNotificacao('emailPrazos')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Notificações por SMS</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-audiencias" className="font-medium">Audiências</Label>
                          <p className="text-sm text-gray-500">Receba um SMS no dia de audiências marcadas</p>
                        </div>
                        <Switch 
                          id="sms-audiencias" 
                          checked={notificacoes.smsAudiencias}
                          onCheckedChange={() => handleToggleNotificacao('smsAudiencias')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-vencimentos" className="font-medium">Vencimentos</Label>
                          <p className="text-sm text-gray-500">Receba um SMS quando houver faturas a vencer</p>
                        </div>
                        <Switch 
                          id="sms-vencimentos" 
                          checked={notificacoes.smsVencimentos}
                          onCheckedChange={() => handleToggleNotificacao('smsVencimentos')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar preferências'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default PerfilUsuarioPage;
