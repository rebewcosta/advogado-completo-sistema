
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="mb-6 bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl animate-slide-in">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-grow lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar documentos por nome, cliente ou processo..."
              className="pl-10 text-sm h-11 w-full bg-white/80 backdrop-blur-sm border-white/30 text-gray-700 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-[180px] h-11 bg-white/60 backdrop-blur-sm border-white/30 text-gray-700 hover:bg-white/80 rounded-xl shadow-sm transition-all duration-200">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-gray-600" />
                  <SelectValue>
                    {filterType === 'all' ? 'Todos os tipos' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl">
                <SelectItem value="all" className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg">Todos os tipos</SelectItem>
                <SelectItem value="contrato" className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg">Contrato</SelectItem>
                <SelectItem value="petição" className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg">Petição</SelectItem>
                <SelectItem value="procuração" className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg">Procuração</SelectItem>
                <SelectItem value="decisão" className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg">Decisão</SelectItem>
                <SelectItem value="outro" className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="w-full lg:w-auto text-sm h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSearchBar;
