
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface StatusData {
  name: string;
  value: number;
  fill: string;
}

interface StatusPieChartProps {
  title: string;
  description: string;
  data: StatusData[];
  icon: React.ReactNode;
  gradient: string;
  emptyMessage: string;
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ 
  title, 
  description, 
  data, 
  icon, 
  gradient, 
  emptyMessage 
}) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className={`${gradient} text-white rounded-t-lg`}>
        <CardTitle className="text-xl font-bold flex items-center">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-white/80">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100}
                  labelLine={false} 
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Itens']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 text-center">{emptyMessage}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;
