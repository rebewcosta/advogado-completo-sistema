
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, RefreshCw, Settings } from 'lucide-react';

const estados = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

interface PublicacoesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtroEstado: string;
  setFiltroEstado: (estado: string) => void;
  filtroTipo: string;
  setFiltroTipo: (tipo: string) => void;
  filtroLida: string;
  setFiltroLida: (lida: string) => void;
  onRefresh: () => void;
  onOpenConfig: () => void;
}

const PublicacoesFilters: React.FC<PublicacoesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filtroEstado,
  setFiltroEstado,
  filtroTipo,
  setFiltroTipo,
  filtroLida,
  setFiltroLida,
  onRefresh,
  onOpenConfig
}) => {
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Filter className="h-5 w-5 text-white" />
            Filtros e Ações
          </CardTitle>
          <div className="flex gap-3">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              className="flex-1 md:flex-initial bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2 text-white" />
              <span className="md:inline">Atualizar</span>
            </Button>
            <Button 
              onClick={onOpenConfig} 
              variant="outline" 
              size="sm" 
              className="flex-1 md:flex-initial bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <Settings className="h-4 w-4 mr-2 text-white" />
              <span className="md:inline">Configurar</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {/* Campo de busca sempre primeiro e em largura total */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
          <Input
            placeholder="Buscar publicações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm"
          />
        </div>
        
        {/* Filtros em grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 backdrop-blur-sm">
              <SelectValue placeholder="Estado" className="text-white/70" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-white/20">
              <SelectItem value="todos" className="hover:bg-blue-50 focus:bg-blue-50">Todos os estados</SelectItem>
              {estados.map(estado => (
                <SelectItem key={estado.uf} value={estado.uf} className="hover:bg-blue-50 focus:bg-blue-50">
                  {estado.uf} - {estado.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 backdrop-blur-sm">
              <SelectValue placeholder="Tipo" className="text-white/70" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-white/20">
              <SelectItem value="todos" className="hover:bg-blue-50 focus:bg-blue-50">Todos os tipos</SelectItem>
              <SelectItem value="Citação" className="hover:bg-blue-50 focus:bg-blue-50">Citação</SelectItem>
              <SelectItem value="Intimação" className="hover:bg-blue-50 focus:bg-blue-50">Intimação</SelectItem>
              <SelectItem value="Sentença" className="hover:bg-blue-50 focus:bg-blue-50">Sentença</SelectItem>
              <SelectItem value="Despacho" className="hover:bg-blue-50 focus:bg-blue-50">Despacho</SelectItem>
              <SelectItem value="Decisão" className="hover:bg-blue-50 focus:bg-blue-50">Decisão</SelectItem>
              <SelectItem value="Edital" className="hover:bg-blue-50 focus:bg-blue-50">Edital</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filtroLida} onValueChange={setFiltroLida}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 backdrop-blur-sm">
              <SelectValue placeholder="Status" className="text-white/70" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-white/20">
              <SelectItem value="todas" className="hover:bg-blue-50 focus:bg-blue-50">Todas</SelectItem>
              <SelectItem value="lida" className="hover:bg-blue-50 focus:bg-blue-50">Lidas</SelectItem>
              <SelectItem value="nao-lida" className="hover:bg-blue-50 focus:bg-blue-50">Não lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicacoesFilters;
