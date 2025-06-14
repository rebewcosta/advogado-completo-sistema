
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipeMembrosTab from '@/components/equipe/EquipeMembrosTab';
import EquipeTarefasTab from '@/components/equipe/EquipeTarefasTab';
import EquipeProdutividadeTab from '@/components/equipe/EquipeProdutividadeTab';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const EquipePage = () => {
  const [membros] = useState([]);
  const [tarefas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Equipe"
          description="Gerencie sua equipe, tarefas e acompanhe a produtividade."
          pageIcon={<Users />}
        />

        <Tabs defaultValue="membros" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="membros">Membros</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
          </TabsList>

          <TabsContent value="membros">
            <EquipeMembrosTab 
              membros={membros}
              searchTerm={searchTerm}
              isSubmitting={isSubmitting}
              onRefresh={handleRefresh}
              setIsSubmitting={setIsSubmitting}
            />
          </TabsContent>

          <TabsContent value="tarefas">
            <EquipeTarefasTab 
              tarefas={tarefas}
              membros={membros}
              searchTerm={searchTerm}
              isSubmitting={isSubmitting}
              onRefresh={handleRefresh}
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
      <Toaster />
    </div>
  );
};

export default EquipePage;
