
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EquipeSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const EquipeSearchBar: React.FC<EquipeSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="bg-lawyer-dark text-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4" />
          <Input
            placeholder="Pesquisar membros, tarefas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 focus:border-white/40"
          />
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="w-full sm:w-auto text-xs h-10 bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white rounded-lg"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''} text-white`} />
          {isLoading ? 'Atualizando...' : 'Atualizar Eventos'}
        </Button>
      </div>
    </div>
  );
};

export default EquipeSearchBar;
