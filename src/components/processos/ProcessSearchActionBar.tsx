
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="mb-6 bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl animate-slide-in">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-grow lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por nº, cliente, tipo..."
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-10 text-sm h-11 w-full bg-white/80 backdrop-blur-sm border-white/30 text-gray-700 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
            />
          </div>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              disabled={isRefreshing}
              className="w-full lg:w-auto text-sm h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessSearchActionBar;
