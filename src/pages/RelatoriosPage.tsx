
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const RelatoriosPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Relatórios"
          description="Análises e relatórios detalhados do seu escritório."
          pageIcon={<BarChart3 />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Processuais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Relatórios sobre o andamento dos processos, prazos e estatísticas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Análises de receitas, despesas e fluxo de caixa do escritório.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Produtividade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Métricas de produtividade da equipe e tempo gasto em atividades.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default RelatoriosPage;
