
import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface FinanceiroSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const FinanceiroSearchBar: React.FC<FinanceiroSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading
}) => {
  return (
    <Card className="mb-6 bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl animate-slide-in">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por descrição, categoria..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm h-11 w-full bg-white/80 backdrop-blur-sm border-white/30 text-gray-700 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto text-sm h-11 bg-white/60 backdrop-blur-sm border-white/30 text-gray-700 hover:bg-white/80 hover:text-gray-800 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              disabled={isLoading} 
              className="w-full sm:w-auto text-sm h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar Transações'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceiroSearchBar;
