
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3 } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Spinner } from '@/components/ui/spinner';

const RelatoriosLoadingState: React.FC = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
         <SharedPageHeader
            title="Relatórios Gerenciais"
            description="Visualize o desempenho e as métricas chave do seu escritório."
            pageIcon={<BarChart3 />}
            showActionButton={false}
          />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-slate-600 font-medium">Carregando relatórios...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RelatoriosLoadingState;
