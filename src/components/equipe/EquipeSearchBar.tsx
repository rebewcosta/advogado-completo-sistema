
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
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-1 shadow-2xl">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por nome, email, CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 pr-4 py-3 text-base h-12 w-full bg-transparent border-0 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 rounded-lg"
              />
            </div>
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              className="lg:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12 px-6"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar Lista'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipeSearchBar;
