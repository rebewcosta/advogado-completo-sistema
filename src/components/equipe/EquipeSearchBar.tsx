
import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
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
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="border-white/20 text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Atualizar Eventos
        </Button>
      </div>
    </div>
  );
};

export default EquipeSearchBar;
