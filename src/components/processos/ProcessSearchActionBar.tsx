
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, Download } from 'lucide-react';

interface ProcessSearchActionBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddProcess: () => void;
  onRefresh: () => void;
  onImportFromOAB?: () => void;
  isLoading?: boolean;
}

const ProcessSearchActionBar: React.FC<ProcessSearchActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddProcess,
  onRefresh,
  onImportFromOAB,
  isLoading = false
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 md:p-6 rounded-xl shadow-xl mb-8 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por número do processo, cliente, tipo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40 h-12 text-base backdrop-blur-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            disabled={isLoading} 
            className="flex-1 sm:flex-none h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar Lista'}
          </Button>
          {onImportFromOAB && (
            <Button 
              onClick={onImportFromOAB} 
              variant="outline"
              disabled={isLoading}
              className="flex-1 sm:flex-none h-12 px-6 bg-orange-600/20 border-orange-300/30 text-white hover:bg-orange-500/30 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Importar da OAB
            </Button>
          )}
          <Button 
            onClick={onAddProcess} 
            className="flex-1 sm:flex-none h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProcessSearchActionBar;
