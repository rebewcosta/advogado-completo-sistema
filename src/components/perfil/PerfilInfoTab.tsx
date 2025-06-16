
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface PerfilInfoTabProps {
  user: User | null;
  nome: string;
  setNome: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  refreshSession: () => Promise<void>;
}

const PerfilInfoTab = ({ user, nome, setNome, email, refreshSession }: PerfilInfoTabProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar o perfil.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Verificar sessão atual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        await refreshSession();
        
        // Verificar novamente após renovar
        const { data: newSessionData, error: newSessionError } = await supabase.auth.getSession();
        
        if (newSessionError || !newSessionData.session) {
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        data: { nome }
      });

      if (error) throw error;

      await refreshSession();
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de nome foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu nome.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
  );
};

export default PerfilInfoTab;
