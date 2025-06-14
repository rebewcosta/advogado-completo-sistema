
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
    <Card className="shadow-sm bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Filter className="h-4 w-4 text-white" />
            Filtros e Ações
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="outline" size="sm" className="flex-1 md:flex-initial bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white">
              <RefreshCw className="h-4 w-4 mr-1 text-white" />
              <span className="md:inline">Atualizar</span>
            </Button>
            <Button onClick={onOpenConfig} variant="outline" size="sm" className="flex-1 md:flex-initial bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white">
              <Settings className="h-4 w-4 mr-1 text-white" />
              <span className="md:inline">Configurar</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Campo de busca sempre primeiro e em largura total */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar publicações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
          />
        </div>
        
        {/* Filtros em grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              <SelectValue placeholder="Estado" className="text-slate-400" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="todos" className="text-white hover:bg-slate-600 focus:bg-slate-600">Todos os estados</SelectItem>
              {estados.map(estado => (
                <SelectItem key={estado.uf} value={estado.uf} className="text-white hover:bg-slate-600 focus:bg-slate-600">
                  {estado.uf} - {estado.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              <SelectValue placeholder="Tipo" className="text-slate-400" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="todos" className="text-white hover:bg-slate-600 focus:bg-slate-600">Todos os tipos</SelectItem>
              <SelectItem value="Citação" className="text-white hover:bg-slate-600 focus:bg-slate-600">Citação</SelectItem>
              <SelectItem value="Intimação" className="text-white hover:bg-slate-600 focus:bg-slate-600">Intimação</SelectItem>
              <SelectItem value="Sentença" className="text-white hover:bg-slate-600 focus:bg-slate-600">Sentença</SelectItem>
              <SelectItem value="Despacho" className="text-white hover:bg-slate-600 focus:bg-slate-600">Despacho</SelectItem>
              <SelectItem value="Decisão" className="text-white hover:bg-slate-600 focus:bg-slate-600">Decisão</SelectItem>
              <SelectItem value="Edital" className="text-white hover:bg-slate-600 focus:bg-slate-600">Edital</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filtroLida} onValueChange={setFiltroLida}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              <SelectValue placeholder="Status" className="text-slate-400" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="todas" className="text-white hover:bg-slate-600 focus:bg-slate-600">Todas</SelectItem>
              <SelectItem value="lida" className="text-white hover:bg-slate-600 focus:bg-slate-600">Lidas</SelectItem>
              <SelectItem value="nao-lida" className="text-white hover:bg-slate-600 focus:bg-slate-600">Não lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicacoesFilters;
