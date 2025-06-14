
import React from 'react';
import { DollarSign } from 'lucide-react';
import PinLock from '@/components/PinLock';
import FinanceiroStatsCards from '@/components/financeiro/FinanceiroStatsCards';
import TransacaoTable from '@/components/financeiro/TransacaoTable';
import TransacaoListAsCards from '@/components/financeiro/TransacaoListAsCards';
import FinanceiroSearchBar from '@/components/financeiro/FinanceiroSearchBar';
import { Card, CardContent } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const FinanceiroPage = () => {
  return (
    <PinLock>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <SharedPageHeader
            title="Financeiro"
            description="Controle suas receitas, despesas e fluxo de caixa."
            pageIcon={<DollarSign />}
          />

          <FinanceiroStatsCards />

          <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4">
              <FinanceiroSearchBar />
            </CardContent>
          </Card>

          {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
          <div className="hidden md:block">
            <TransacaoTable />
          </div>
          <div className="md:hidden">
            <TransacaoListAsCards />
          </div>
        </div>
        <Toaster />
      </div>
    </PinLock>
  );
};

export default FinanceiroPage;
