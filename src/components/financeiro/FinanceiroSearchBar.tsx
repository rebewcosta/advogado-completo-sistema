
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
    <Card className="mb-6 shadow-md rounded-lg border border-slate-700 bg-slate-800">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por descrição, categoria..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm h-10 w-full bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-10 bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white rounded-lg">
              <Filter className="mr-1.5 h-3.5 w-3.5 text-white" />
              Filtrar
            </Button>
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              disabled={isLoading} 
              className="w-full sm:w-auto text-xs h-10 bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white rounded-lg"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-white ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar Transações'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceiroSearchBar;
