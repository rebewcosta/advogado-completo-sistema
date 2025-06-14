
import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TarefaTable from '@/components/tarefas/TarefaTable';
import TarefaListAsCards from '@/components/tarefas/TarefaListAsCards';
import TarefaSearchActionBar from '@/components/tarefas/TarefaSearchActionBar';
import TarefaFormDialog from '@/components/tarefas/TarefaFormDialog';
import { useTarefas } from '@/hooks/useTarefas';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const TarefasPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>("todas");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const {
    tarefas,
    isLoading,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    fetchTarefas
  } = useTarefas();

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const filteredTarefas = tarefas.filter(tarefa => {
    const matchesSearch = tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tarefa.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || tarefa.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === "todas" || tarefa.prioridade === prioridadeFilter;
    
    return matchesSearch && matchesStatus && matchesPrioridade;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenNewTaskForm = () => {
    setIsFormDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Tarefas"
          description="Organize e acompanhe suas tarefas e atividades."
          pageIcon={<CheckSquare />}
          actionButtonText="Nova Tarefa"
          onActionButtonClick={handleOpenNewTaskForm}
          isLoading={isLoading}
        />

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
          <CardContent className="p-4">
            <TarefaSearchActionBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              prioridadeFilter={prioridadeFilter}
              onPrioridadeFilterChange={setPrioridadeFilter}
              onNewTask={handleOpenNewTaskForm}
            />
          </CardContent>
        </Card>

        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
          <TarefaTable
            tarefas={filteredTarefas}
            onUpdate={updateTarefa}
            onDelete={deleteTarefa}
            isLoading={isLoading}
          />
        </div>
        <div className="md:hidden">
          <TarefaListAsCards
            tarefas={filteredTarefas}
            onUpdate={updateTarefa}
            onDelete={deleteTarefa}
            isLoading={isLoading}
          />
        </div>

        <TarefaFormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          onSubmit={createTarefa}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default TarefasPage;
