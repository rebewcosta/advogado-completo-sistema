
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle } from 'lucide-react';
import EquipeTarefaCard from './EquipeTarefaCard';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

interface EquipeTarefasListProps {
  tarefas: EquipeTarefa[];
  membros: EquipeMembro[];
  searchTerm: string;
  isSubmitting: boolean;
  onEdit: (tarefa: EquipeTarefa) => void;
  onDelete: (tarefa: EquipeTarefa) => void;
  onCreateNew: () => void;
}

const EquipeTarefasList: React.FC<EquipeTarefasListProps> = ({
  tarefas,
  membros,
  searchTerm,
  isSubmitting,
  onEdit,
  onDelete,
  onCreateNew
}) => {
  const filteredTarefas = tarefas.filter(tarefa =>
    tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarefa.descricao_detalhada && tarefa.descricao_detalhada.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (filteredTarefas.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in">
        <CardContent className="py-12 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'Nenhuma tarefa encontrada' : 'Organize sua equipe'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece delegando tarefas para sua equipe'
            }
          </p>
          {!searchTerm && membros.length > 0 && (
            <Button 
              onClick={onCreateNew}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Tarefa
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {filteredTarefas.map((tarefa, index) => (
        <div 
          key={tarefa.id}
          className="animate-slide-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <EquipeTarefaCard
            tarefa={tarefa}
            onEdit={onEdit}
            onDelete={onDelete}
            isSubmitting={isSubmitting}
          />
        </div>
      ))}
    </div>
  );
};

export default EquipeTarefasList;
