
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';

const ModernFinanceiroContent: React.FC = () => {
  const financeiroData = [
    { mes: 'Jan/25', receitas: 0, despesas: 0, lucro: 0 },
    { mes: 'Fev/25', receitas: 0, despesas: 0, lucro: 0 },
    { mes: 'Mar/25', receitas: 0, despesas: 0, lucro: 0 },
    { mes: 'Abr/25', receitas: 0, despesas: 0, lucro: 0 },
    { mes: 'Mai/25', receitas: 0, despesas: 0, lucro: 0 },
    { mes: 'Jun/25', receitas: 4000, despesas: 450, lucro: 3550 }
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold flex items-center">
          <DollarSign className="mr-3 h-6 w-6" />
          Visão Financeira
        </CardTitle>
        <p className="text-slate-300 text-sm">Receitas vs. Despesas nos últimos 6 meses</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financeiroData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              <Bar dataKey="lucro" fill="#6366f1" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernFinanceiroContent;
