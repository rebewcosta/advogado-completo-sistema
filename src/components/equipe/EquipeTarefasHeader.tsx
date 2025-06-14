
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];

interface EquipeTarefasHeaderProps {
  membros: EquipeMembro[];
  onCreateNew: () => void;
}

const EquipeTarefasHeader: React.FC<EquipeTarefasHeaderProps> = ({
  membros,
  onCreateNew
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Tarefas da Equipe</h2>
          <p className="text-gray-600 text-sm">Delegue e acompanhe tarefas da equipe</p>
        </div>
        <Button 
          onClick={onCreateNew}
          className="mt-4 sm:mt-0 bg-lawyer-primary hover:bg-lawyer-primary/90"
          disabled={membros.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {membros.length === 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Adicione membros à equipe antes de criar tarefas.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EquipeTarefasHeader;
