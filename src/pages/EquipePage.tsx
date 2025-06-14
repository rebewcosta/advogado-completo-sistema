
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Spinner } from '@/components/ui/spinner';
import EquipeMembrosTab from '@/components/equipe/EquipeMembrosTab';
import EquipeTarefasTab from '@/components/equipe/EquipeTarefasTab';
import EquipeProdutividadeTab from '@/components/equipe/EquipeProdutividadeTab';
import { Search, UserPlus, ClipboardList, BarChart3 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

const EquipePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("membros");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para membros
  const [membros, setMembros] = useState<EquipeMembro[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para tarefas
  const [tarefas, setTarefas] = useState<EquipeTarefa[]>([]);

  const fetchMembros = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('equipe_membros')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');
      
      if (error) throw error;
      setMembros(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar membros da equipe",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchTarefas = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('equipe_tarefas')
        .select(`
          *,
          responsavel:equipe_membros!responsavel_id(id, nome),
          delegado_por:equipe_membros!delegado_por_id(id, nome)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      const tarefasFormatadas = (data || []).map(tarefa => ({
        ...tarefa,
        responsavel: Array.isArray(tarefa.responsavel) ? tarefa.responsavel[0] : tarefa.responsavel,
        delegado_por: Array.isArray(tarefa.delegado_por) ? tarefa.delegado_por[0] : tarefa.delegado_por
      }));
      
      setTarefas(tarefasFormatadas);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tarefas da equipe",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await Promise.all([
        fetchMembros(),
        fetchTarefas()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchMembros, fetchTarefas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3">Carregando equipe...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
          title="Gestão de Equipe"
          description="Gerencie membros, delegue tarefas e acompanhe a produtividade da sua equipe."
          pageIcon={<Users />}
          showActionButton={false}
        />

        {/* Barra de Pesquisa */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar membros, tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="membros" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Membros</span>
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Tarefas</span>
            </TabsTrigger>
            <TabsTrigger value="produtividade" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Produtividade</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="membros">
            <EquipeMembrosTab
              membros={membros}
              searchTerm={searchTerm}
              isSubmitting={isSubmitting}
              onRefresh={fetchMembros}
              setIsSubmitting={setIsSubmitting}
            />
          </TabsContent>

          <TabsContent value="tarefas">
            <EquipeTarefasTab
              tarefas={tarefas}
              membros={membros}
              searchTerm={searchTerm}
              isSubmitting={isSubmitting}
              onRefresh={fetchTarefas}
              setIsSubmitting={setIsSubmitting}
            />
          </TabsContent>

          <TabsContent value="produtividade">
            <EquipeProdutividadeTab
              membros={membros}
              searchTerm={searchTerm}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EquipePage;
