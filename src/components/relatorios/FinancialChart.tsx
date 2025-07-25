
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { FinanceValueToggle } from '@/components/finance/FinanceValueToggle';

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  lucro: number;
}

interface FinancialChartProps {
  monthlyFinancialData: MonthlyData[];
  formatCurrency: (value: number) => string;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ monthlyFinancialData, formatCurrency }) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Visão Financeira
        </CardTitle>
        <CardDescription className="text-slate-200">
          Receitas vs. Despesas nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFinancialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  <FinanceValueToggle 
                    key={name}
                    value={value} 
                    formatValue={formatCurrency}
                  />, 
                  name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Lucro'
                ]}
                labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
              <Bar dataKey="lucro" fill="#6366f1" radius={[4, 4, 0, 0]} name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialChart;
