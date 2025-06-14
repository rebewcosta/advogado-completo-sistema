
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from 'lucide-react';

interface ProcessSearchActionBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewProcess: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ProcessSearchActionBar: React.FC<ProcessSearchActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onNewProcess,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar por nº, cliente, tipo..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 text-sm h-10 w-full bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
        />
      </div>
      {onRefresh && (
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm" 
          disabled={isRefreshing} 
          className="w-full sm:w-auto text-xs h-10 bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white rounded-lg"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''} text-white`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}
        </Button>
      )}
    </div>
  );
};

export default ProcessSearchActionBar;
