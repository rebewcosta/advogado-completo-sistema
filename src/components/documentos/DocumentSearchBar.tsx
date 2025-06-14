
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface DocumentSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  handleRefresh,
  isRefreshing
}) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Buscar documentos por nome, cliente ou processo..."
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-white" />
                {filterType === 'all' ? 'Todos os tipos' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-white hover:bg-slate-600 focus:bg-slate-600">Todos os tipos</SelectItem>
              <SelectItem value="contrato" className="text-white hover:bg-slate-600 focus:bg-slate-600">Contrato</SelectItem>
              <SelectItem value="petição" className="text-white hover:bg-slate-600 focus:bg-slate-600">Petição</SelectItem>
              <SelectItem value="procuração" className="text-white hover:bg-slate-600 focus:bg-slate-600">Procuração</SelectItem>
              <SelectItem value="decisão" className="text-white hover:bg-slate-600 focus:bg-slate-600">Decisão</SelectItem>
              <SelectItem value="outro" className="text-white hover:bg-slate-600 focus:bg-slate-600">Outro</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentSearchBar;
