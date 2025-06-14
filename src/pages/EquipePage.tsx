
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Spinner } from '@/components/ui/spinner';
import EquipeSearchBar from '@/components/equipe/EquipeSearchBar';
import EquipeTabs from '@/components/equipe/EquipeTabs';
import { useEquipeData } from '@/hooks/useEquipeData';

const EquipePage = () => {
  const [activeTab, setActiveTab] = useState("membros");
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    isLoading,
    membros,
    tarefas,
    isSubmitting,
    setIsSubmitting,
    fetchMembros,
    fetchTarefas,
    fetchData
  } = useEquipeData();

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

        <EquipeSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchData}
          isLoading={isLoading}
        />

        <EquipeTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          membros={membros}
          tarefas={tarefas}
          searchTerm={searchTerm}
          isSubmitting={isSubmitting}
          onRefreshMembros={fetchMembros}
          onRefreshTarefas={fetchTarefas}
          setIsSubmitting={setIsSubmitting}
        />
      </div>
    </AdminLayout>
  );
};

export default EquipePage;
