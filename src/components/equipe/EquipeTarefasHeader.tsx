
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, AlertTriangle } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Tarefas da Equipe
          </h2>
          <p className="text-gray-600 text-sm mt-1">Delegue e acompanhe tarefas da equipe com eficiência</p>
        </div>
        <Button 
          onClick={onCreateNew}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
          disabled={membros.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {membros.length === 0 && (
        <Card className="mb-8 bg-white/70 backdrop-blur-lg border border-amber-200/50 shadow-xl rounded-2xl animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Adicione membros primeiro</h3>
                <p className="text-amber-700 text-sm mt-1">
                  Para criar tarefas, você precisa ter membros cadastrados na equipe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EquipeTarefasHeader;
