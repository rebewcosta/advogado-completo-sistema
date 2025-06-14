
import React, { useState } from 'react';
import EquipeTarefasHeader from './EquipeTarefasHeader';
import EquipeTarefasList from './EquipeTarefasList';
import EquipeTarefaForm from './EquipeTarefaForm';
import { useEquipeTarefas } from '@/hooks/useEquipeTarefas';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

interface EquipeTarefasTabProps {
  tarefas: EquipeTarefa[];
  membros: EquipeMembro[];
  searchTerm: string;
  isSubmitting: boolean;
  onRefresh: () => void;
  setIsSubmitting: (loading: boolean) => void;
}

const EquipeTarefasTab: React.FC<EquipeTarefasTabProps> = ({
  tarefas,
  membros,
  searchTerm,
  isSubmitting: externalIsSubmitting,
  onRefresh,
  setIsSubmitting: setExternalIsSubmitting
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<EquipeTarefa | null>(null);
  
  const {
    isSubmitting: localIsSubmitting,
    setIsSubmitting: setLocalIsSubmitting,
    deleteTarefa,
    convertToFormInterface
  } = useEquipeTarefas();

  const isSubmitting = externalIsSubmitting || localIsSubmitting;

  const handleEdit = (tarefa: EquipeTarefa) => {
    setTarefaEditando(tarefa);
    setIsFormOpen(true);
  };

  const handleDelete = async (tarefa: EquipeTarefa) => {
    setExternalIsSubmitting(true);
    await deleteTarefa(tarefa, onRefresh);
    setExternalIsSubmitting(false);
  };

  const handleCreateNew = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTarefaEditando(null);
  };

  return (
    <>
      <EquipeTarefasHeader
        membros={membros}
        onCreateNew={handleCreateNew}
      />

      <EquipeTarefasList
        tarefas={tarefas}
        membros={membros}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />

      {isFormOpen && (
        <EquipeTarefaForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={onRefresh}
          tarefa={tarefaEditando ? convertToFormInterface(tarefaEditando) : null}
        />
      )}
    </>
  );
};

export default EquipeTarefasTab;
