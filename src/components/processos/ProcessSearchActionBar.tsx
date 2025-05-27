// src/components/processos/ProcessSearchActionBar.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from 'lucide-react';

interface ProcessSearchActionBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProcessSearchActionBar: React.FC<ProcessSearchActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="relative flex-grow sm:max-w-xs md:max-w-sm"> {/* Ajustado max-width */}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" /> {/* Ajustado posicionamento do ícone */}
        <Input
          type="text"
          placeholder="Buscar por nº, cliente, tipo..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 text-sm h-10 w-full bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-lawyer-primary focus:border-lawyer-primary" // Estilo mais próximo da referência
        />
      </div>
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        size="sm" 
        disabled={isRefreshing} 
        className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg" // Estilo do botão
      >
        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> {/* Ajustado tamanho do ícone */}
        {isRefreshing ? 'Atualizando...' : 'Atualizar'}
      </Button>
    </div>
  );
};

export default ProcessSearchActionBar;