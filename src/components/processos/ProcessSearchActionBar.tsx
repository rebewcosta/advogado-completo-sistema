
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar por nº, cliente, tipo..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 text-sm h-10 w-full bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-lawyer-primary focus:border-lawyer-primary"
        />
      </div>
    </div>
  );
};

export default ProcessSearchActionBar;
