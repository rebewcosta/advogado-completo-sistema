
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from 'lucide-react';

interface ProcessSearchActionBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewProcess: () => void;
}

const ProcessSearchActionBar: React.FC<ProcessSearchActionBarProps> = ({
  searchTerm,
  onSearchChange,
  onNewProcess
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="relative w-64">
        <Input
          type="text"
          placeholder="Buscar processos..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <Button onClick={onNewProcess}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Processo
      </Button>
    </div>
  );
};

export default ProcessSearchActionBar;
