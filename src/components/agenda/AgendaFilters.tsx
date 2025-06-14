
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RefreshCw } from 'lucide-react';

interface AgendaFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const AgendaFilters: React.FC<AgendaFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing
}) => {
  return (
    <Card className="mb-6 shadow-md rounded-lg border border-slate-700 bg-slate-800">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
          </div>
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm" 
            disabled={isRefreshing}
            className="bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Atualizando..." : "Atualizar Eventos"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgendaFilters;
