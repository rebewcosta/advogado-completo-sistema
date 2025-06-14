
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
    <div className="mb-8 animate-slide-in">
      <div className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-grow lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Pesquisar membros, tarefas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm h-11 w-full bg-white/80 backdrop-blur-sm border-white/30 text-gray-700 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
            />
          </div>
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={isLoading}
            className="w-full lg:w-auto text-sm h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar Lista'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipeSearchBar;
