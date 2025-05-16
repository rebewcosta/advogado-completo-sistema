
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, onAddClick }) => {
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
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Processo
      </Button>
    </div>
  );
};

export default SearchBar;
