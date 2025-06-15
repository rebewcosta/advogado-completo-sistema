
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ModernMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  formatValue?: (value: number) => string;
  gradient: string;
}

const ModernMetricCard: React.FC<ModernMetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  formatValue, 
  gradient 
}) => {
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
            {typeof value === 'number' && formatValue ? formatValue(value) : value}
          </h3>
          <p className="text-white/80 text-sm font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernMetricCard;
