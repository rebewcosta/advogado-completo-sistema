
import React from 'react';
import { Search, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DocumentSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUpload: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const DocumentSearchBar: React.FC<DocumentSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onUpload,
  onRefresh,
  isLoading = false
}) => {
  return (
    <div className="mb-8 animate-slide-in">
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-1 shadow-2xl">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por nome do arquivo, tipo, cliente..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 pr-4 py-3 text-base h-12 w-full bg-transparent border-0 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onRefresh}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12 px-6"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Lista
              </Button>
              <Button
                onClick={onUpload}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 h-12 px-6"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSearchBar;
