
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FinanceValueToggle } from '@/components/finance/FinanceValueToggle';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  formatValue?: (value: number) => string;
  gradient: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, formatValue, gradient }) => {
  const isFinancialValue = typeof value === 'number' && (formatValue || title.toLowerCase().includes('receita') || title.toLowerCase().includes('lucro') || title.toLowerCase().includes('despesa'));

  return (
    <Card className={`relative overflow-hidden ${gradient} border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">
            {isFinancialValue && typeof value === 'number' ? (
              <FinanceValueToggle 
                value={value} 
                formatValue={formatValue}
                className="text-white"
              />
            ) : (
              typeof value === 'number' && formatValue ? formatValue(value) : value
            )}
          </h3>
          <p className="text-white/80 text-sm font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
