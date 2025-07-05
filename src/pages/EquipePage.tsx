
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
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-full flex flex-col justify-center items-center">
          <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl animate-fade-in">
            <Spinner size="lg" className="text-blue-500" />
            <span className="text-gray-700 mt-4 block font-medium">Carregando equipe...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-full">
        <div className="animate-fade-in">
          <SharedPageHeader
            title="Gestão de Equipe"
            description="Gerencie membros, delegue tarefas e acompanhe a produtividade da sua equipe com ferramentas modernas."
            pageIcon={<Users className="text-blue-500" />}
            showActionButton={false}
          />
        </div>

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
