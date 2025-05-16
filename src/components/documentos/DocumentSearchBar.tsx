
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
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Buscar documentos por nome, cliente ou processo..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {filterType === 'all' ? 'Todos os tipos' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="contrato">Contrato</SelectItem>
            <SelectItem value="petição">Petição</SelectItem>
            <SelectItem value="procuração">Procuração</SelectItem>
            <SelectItem value="decisão">Decisão</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentSearchBar;
