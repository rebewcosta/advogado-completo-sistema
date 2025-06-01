
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Clock, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeProdutividade = Database['public']['Tables']['equipe_produtividade']['Row'] & {
  membro?: { id: string; nome: string } | null;
};

interface EquipeProdutividadeTabProps {
  membros: EquipeMembro[];
  searchTerm: string;
}

const EquipeProdutividadeTab: React.FC<EquipeProdutividadeTabProps> = ({
  membros,
  searchTerm
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [produtividade, setProdutividade] = useState<EquipeProdutividade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutividade = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('equipe_produtividade')
        .select(`
          *,
          membro:membro_id(id, nome)
        `)
        .eq('user_id', user.id)
        .order('data_registro', { ascending: false });
      
      if (error) throw error;
      setProdutividade(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtividade",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProdutividade();
  }, [fetchProdutividade]);

  const filteredProdutividade = produtividade.filter(prod =>
    prod.membro?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas gerais
  const estatisticas = {
    totalHoras: produtividade.reduce((acc, p) => acc + (p.horas_trabalhadas || 0), 0),
    totalTarefas: produtividade.reduce((acc, p) => acc + (p.tarefas_concluidas || 0), 0),
    totalClientes: produtividade.reduce((acc, p) => acc + (p.clientes_atendidos || 0), 0),
    totalProcessos: produtividade.reduce((acc, p) => acc + (p.processos_atualizados || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lawyer-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Produtividade da Equipe</h2>
          <p className="text-gray-600 text-sm">Acompanhe o desempenho e produtividade</p>
        </div>
      </div>

      {membros.length === 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Adicione membros à equipe para acompanhar a produtividade.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Horas</p>
                <p className="text-2xl font-bold">{estatisticas.totalHoras.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tarefas Concluídas</p>
                <p className="text-2xl font-bold">{estatisticas.totalTarefas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Atendidos</p>
                <p className="text-2xl font-bold">{estatisticas.totalClientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processos Atualizados</p>
                <p className="text-2xl font-bold">{estatisticas.totalProcessos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Registros de Produtividade */}
      {filteredProdutividade.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'Nenhum registro encontrado' : 'Nenhum registro de produtividade ainda'}
            </p>
            <p className="text-sm text-gray-400">
              Os registros de produtividade podem ser adicionados manualmente ou através de integrações futuras.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProdutividade.map((prod) => (
            <Card key={prod.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {prod.membro?.nome || 'Membro não encontrado'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(prod.data_registro + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {prod.horas_trabalhadas || 0}h trabalhadas
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-semibold text-green-700">{prod.tarefas_concluidas || 0}</p>
                    <p className="text-green-600">Tarefas</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="font-semibold text-purple-700">{prod.clientes_atendidos || 0}</p>
                    <p className="text-purple-600">Clientes</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="font-semibold text-orange-700">{prod.processos_atualizados || 0}</p>
                    <p className="text-orange-600">Processos</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-semibold text-blue-700">{prod.horas_trabalhadas || 0}h</p>
                    <p className="text-blue-600">Horas</p>
                  </div>
                </div>
                
                {prod.observacoes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Observações:</strong> {prod.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default EquipeProdutividadeTab;
