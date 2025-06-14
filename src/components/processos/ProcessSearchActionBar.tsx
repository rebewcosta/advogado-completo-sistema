
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
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-xl mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por nº, cliente, tipo..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40 h-12 text-base backdrop-blur-sm"
          />
        </div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="w-full sm:w-auto h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProcessSearchActionBar;
