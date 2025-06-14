
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
    <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por descrição, categoria..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm h-10 w-full bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-lawyer-primary focus:border-lawyer-primary"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filtrar
            </Button>
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              disabled={isLoading} 
              className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar Transações'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceiroSearchBar;
