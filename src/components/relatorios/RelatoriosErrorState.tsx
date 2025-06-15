
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RelatoriosErrorStateProps {
  error: string;
  onRetry: () => void;
}

const RelatoriosErrorState: React.FC<RelatoriosErrorStateProps> = ({ error, onRetry }) => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
          <SharedPageHeader
            title="Relatórios Gerenciais"
            description="Visualize o desempenho e as métricas chave do seu escritório."
            pageIcon={<BarChart3 />}
            showActionButton={false}
          />
          <Card className="border-red-200 bg-red-50 mt-8 shadow-lg">
              <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5"/>
                Erro ao Carregar Relatórios
              </CardTitle>
              </CardHeader>
              <CardContent>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry} className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="mr-2 h-4 w-4"/> Tentar Novamente
              </Button>
              </CardContent>
          </Card>
      </div>
    </AdminLayout>
  );
};

export default RelatoriosErrorState;
