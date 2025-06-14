
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
    <div className="animate-fade-in">
      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border-0 h-14 p-1 rounded-xl">
          <TabsTrigger 
            value="membros" 
            className="flex items-center gap-2 h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Membros</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tarefas" 
            className="flex items-center gap-2 h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Tarefas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="produtividade" 
            className="flex items-center gap-2 h-12 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Produtividade</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="membros" className="space-y-6">
          <EquipeMembrosTab
            membros={membros}
            searchTerm={searchTerm}
            isSubmitting={isSubmitting}
            onRefresh={onRefreshMembros}
            setIsSubmitting={setIsSubmitting}
          />
        </TabsContent>

        <TabsContent value="tarefas" className="space-y-6">
          <EquipeTarefasTab
            tarefas={tarefas}
            membros={membros}
            searchTerm={searchTerm}
            isSubmitting={isSubmitting}
            onRefresh={onRefreshTarefas}
            setIsSubmitting={setIsSubmitting}
          />
        </TabsContent>

        <TabsContent value="produtividade" className="space-y-6">
          <EquipeProdutividadeTab
            membros={membros}
            searchTerm={searchTerm}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipeTabs;
