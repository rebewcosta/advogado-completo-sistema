
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, ClipboardList, BarChart3 } from 'lucide-react';
import EquipeMembrosTab from './EquipeMembrosTab';
import EquipeTarefasTab from './EquipeTarefasTab';
import EquipeProdutividadeTab from './EquipeProdutividadeTab';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

interface EquipeTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  membros: EquipeMembro[];
  tarefas: EquipeTarefa[];
  searchTerm: string;
  isSubmitting: boolean;
  onRefreshMembros: () => void;
  onRefreshTarefas: () => void;
  setIsSubmitting: (loading: boolean) => void;
}

const EquipeTabs: React.FC<EquipeTabsProps> = ({
  activeTab,
  onTabChange,
  membros,
  tarefas,
  searchTerm,
  isSubmitting,
  onRefreshMembros,
  onRefreshTarefas,
  setIsSubmitting
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="membros" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Membros</span>
        </TabsTrigger>
        <TabsTrigger value="tarefas" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Tarefas</span>
        </TabsTrigger>
        <TabsTrigger value="produtividade" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Produtividade</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="membros">
        <EquipeMembrosTab
          membros={membros}
          searchTerm={searchTerm}
          isSubmitting={isSubmitting}
          onRefresh={onRefreshMembros}
          setIsSubmitting={setIsSubmitting}
        />
      </TabsContent>

      <TabsContent value="tarefas">
        <EquipeTarefasTab
          tarefas={tarefas}
          membros={membros}
          searchTerm={searchTerm}
          isSubmitting={isSubmitting}
          onRefresh={onRefreshTarefas}
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
  );
};

export default EquipeTabs;
