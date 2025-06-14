
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TarefaSearchActionBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const TarefaSearchActionBar: React.FC<TarefaSearchActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading
}) => {
  return (
    <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={onSearchChange}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm"
              />
            </div>
          </div>
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
          >
            <RefreshCw className={`mr-2 h-4 w-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Atualizando..." : "Atualizar Tarefas"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TarefaSearchActionBar;
