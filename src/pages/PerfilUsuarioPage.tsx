// Caminho: advogado-completo-sistema-main/src/pages/PerfilUsuarioPage.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura'; // Componente chave
import { Spinner } from '@/components/ui/spinner';
import { User, Settings, CreditCard, Shield } from 'lucide-react'; // Adicionei Shield para consistência se necessário
import { supabase } from '@/integrations/supabase/client';

const PerfilUsuarioPage = () => {
  const [isLoading, setIsLoading] = useState(false); // Pode ser usado para carregar dados do perfil se necessário
  const [isSaving, setIsSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const { user, refreshSession } = useAuth(); // Adicionado refreshSession
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setNome(user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário');
    }
  }, [user]);

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { nome }
      });

      if (error) throw error;

      await refreshSession(); // Atualiza os dados do usuário no contexto Auth
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de nome foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu nome.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Erro", description: "As novas senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      // A API updateUser do Supabase pode verificar a senha atual implicitamente se configurado,
      // mas para uma mudança explícita, o ideal seria uma Edge Function se a senha atual fosse obrigatória para validação.
      // Para simplificar aqui, vamos apenas tentar atualizar.
      // NOTA: supabase.auth.updateUser NÃO valida a 'senha atual' diretamente.
      //       A forma correta de mudar senha exigindo a atual seria mais complexa
      //       ou envolveria um fluxo de reautenticação.
      //       Por ora, estamos apenas mudando para a nova senha.
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso." });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading && !user) { // Ajuste: mostra loading apenas se o usuário ainda não carregou
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
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Minha Conta</h1>
          <p className="text-gray-500">Gerencie suas informações, assinatura e segurança.</p>
        </div>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="assinatura" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Assinatura
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSalvarPerfil} className="space-y-6 max-w-lg">
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
                      type="email"
                      value={email}
                      disabled
                      readOnly
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500">O email não pode ser alterado através desta página.</p>
                  </div>
                  <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? (
                      <><Spinner size="sm" className="mr-2" /> Salvando...</>
                    ) : (
                      'Salvar Nome'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assinatura">
            <Card>
              <CardHeader>
                <CardTitle>Status da Conta e Assinatura</CardTitle>
                <CardDescription>
                  Visualize o tipo da sua conta e os detalhes da sua assinatura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GerenciarAssinatura /> {/* Nosso componente modificado! */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Altere sua senha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                  {/* O campo "Senha atual" foi removido pois supabase.auth.updateUser não o valida diretamente
                      Para implementar isso de forma segura, seria necessário um fluxo de reautenticação
                      ou uma Edge Function que valide a senha atual antes de tentar a atualização.
                      Para simplificar, permitiremos a mudança direta se o usuário estiver logado.
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual (necessária para alterar)</Label>
                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrent