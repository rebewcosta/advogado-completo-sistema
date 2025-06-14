
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
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa delegada ainda'}
          </p>
          {!searchTerm && membros.length > 0 && (
            <Button 
              onClick={onCreateNew}
              className="mt-4 bg-lawyer-primary hover:bg-lawyer-primary/90"
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
    <div className="space-y-4">
      {filteredTarefas.map((tarefa) => (
        <EquipeTarefaCard
          key={tarefa.id}
          tarefa={tarefa}
          onEdit={onEdit}
          onDelete={onDelete}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
};

export default EquipeTarefasList;
