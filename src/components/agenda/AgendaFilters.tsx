
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgendaFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onAddEvent: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const AgendaFilters: React.FC<AgendaFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isLoading = false
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-xl mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por título, local, cliente..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40 h-12 text-base backdrop-blur-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-48 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg backdrop-blur-sm">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Agendado">Agendados</SelectItem>
              <SelectItem value="Realizado">Realizados</SelectItem>
              <SelectItem value="Cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar Lista'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgendaFilters;
