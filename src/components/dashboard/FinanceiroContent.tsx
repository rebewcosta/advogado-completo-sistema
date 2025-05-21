// src/components/dashboard/FinanceiroContent.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, ListFilter, History, PlusCircle, ArrowRight } from 'lucide-react'; // Ícones ajustados
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Dados de exemplo (mock) - substitua por dados reais quando disponíveis
const summaryData = [
  { title: "Receita do Mês", value: "R$ 0,00", icon: TrendingUp, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/30" },
  { title: "Despesas do Mês", value: "R$ 0,00", icon: TrendingDown, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-900/30" },
  { title: "Saldo Atual", value: "R$ 0,00", icon: DollarSign, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/30" },
  { title: "Contas a Receber", value: "R$ 0,00", icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-900/30" },
];

const FinanceiroContent: React.FC = () => {
  // No futuro, você buscará dados reais aqui
  const transactions: any[] = []; // Placeholder para transações

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {summaryData.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.title}
                </CardTitle>
                <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{item.value}</div>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+20.1% from last month</p> */}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Histórico de Transações */}
      <Card className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">Histórico de Transações</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Visualize suas movimentações financeiras recentes.
              </CardDescription>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link to="/financeiro" className="flex items-center">
                  <ListFilter className="h-3.5 w-3.5 mr-1.5" /> Filtrar
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild className="bg-lawyer-primary hover:bg-lawyer-primary/90">
                <Link to="/financeiro" className="flex items-center"> {/* Ajuste o link para a página de adicionar transação */}
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Nova Transação
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-10 md:py-16 text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <History className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-md font-medium mb-1">Nenhuma transação registrada ainda.</p>
              <p className="text-sm">Comece adicionando suas receitas e despesas.</p>
              <Button variant="link" size="sm" asChild className="mt-3 text-lawyer-primary">
                <Link to="/financeiro">
                  Ir para Financeiro <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              {/* Aqui iria a lista ou tabela de transações */}
              <p className="text-sm text-gray-700 dark:text-gray-300">Lista de transações aparecerá aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroContent;