
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  lucro: number;
}

interface DashboardChartProps {
  title: string;
  description: string;
  data: MonthlyData[];
  formatCurrency: (value: number) => string;
  gradient: string;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ 
  title, 
  description, 
  data, 
  formatCurrency, 
  gradient 
}) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className={`${gradient} text-white rounded-t-lg`}>
        <CardTitle className="text-xl font-bold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-white/80">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#64748b' }}
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
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

export default DashboardChart;
