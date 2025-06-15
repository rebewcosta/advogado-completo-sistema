
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, Search, Filter } from 'lucide-react';

interface AgendaFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAddEvent: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const AgendaFilters: React.FC<AgendaFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddEvent,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 shadow-xl border-0 mb-6 sm:mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4 sm:h-5 sm:w-5" />
        <Input
          placeholder="Buscar por título, local, cliente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 sm:pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/25 focus:border-white/50 h-10 sm:h-12 text-sm sm:text-base"
        />
      </div>

      {/* Filters and Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          <Filter className="h-4 w-4 text-white/80 flex-shrink-0" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white text-sm sm:text-base h-9 sm:h-10 min-w-0 flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Agendado">Agendado</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-300 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex-shrink-0"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Atualizar</span>
          </Button>
          
          <Button
            onClick={onAddEvent}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium flex-shrink-0"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="whitespace-nowrap">Novo Evento</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgendaFilters;
