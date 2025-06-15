
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { AlertFilters } from '../types/alertTypes';

interface AlertFiltersProps {
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
  onReset: () => void;
}

export const AlertFiltersComponent: React.FC<AlertFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const updateFilter = (key: keyof AlertFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter className="h-4 w-4" />
        Filtros
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Buscar por título ou descrição..."
            value={filters.termoBusca}
            onChange={(e) => updateFilter('termoBusca', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendentes">Pendentes</SelectItem>
              <SelectItem value="enviados">Enviados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={filters.tipo} onValueChange={(value) => updateFilter('tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button variant="outline" onClick={onReset} className="w-full">
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
