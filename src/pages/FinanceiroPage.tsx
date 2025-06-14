
import React, { useState } from 'react';
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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Updated stats to match StatsData interface
  const stats = {
    receitasConfirmadas: 0,
    despesasConfirmadas: 0,
    saldoAtual: 0,
    receitasPendentes: 0,
    despesasPendentes: 0
  };

  const handlePinVerified = () => {
    console.log('PIN verified');
    setIsUnlocked(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  const handleEdit = (transacao: any) => {
    console.log('Edit transaction:', transacao.id);
  };

  const handleDelete = (transacao: any) => {
    console.log('Delete transaction:', transacao.id);
  };

  if (!isUnlocked) {
    return (
      <PinLock 
        onPinVerified={handlePinVerified} 
        pageName="Financeiro"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Financeiro"
          description="Controle suas receitas, despesas e fluxo de caixa."
          pageIcon={<DollarSign />}
        />

        <FinanceiroStatsCards stats={stats} />

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
          <CardContent className="p-4">
            <FinanceiroSearchBar 
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
          <TransacaoTable 
            transacoes={transacoes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            searchTerm={searchTerm}
          />
        </div>
        <div className="md:hidden">
          <TransacaoListAsCards 
            transacoes={transacoes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            searchTerm={searchTerm}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default FinanceiroPage;
