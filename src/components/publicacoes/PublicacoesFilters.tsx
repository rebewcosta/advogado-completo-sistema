
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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Ações
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={onOpenConfig} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar publicações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {estados.map(estado => (
                <SelectItem key={estado.uf} value={estado.uf}>
                  {estado.uf} - {estado.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de publicação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="Citação">Citação</SelectItem>
              <SelectItem value="Intimação">Intimação</SelectItem>
              <SelectItem value="Sentença">Sentença</SelectItem>
              <SelectItem value="Despacho">Despacho</SelectItem>
              <SelectItem value="Decisão">Decisão</SelectItem>
              <SelectItem value="Edital">Edital</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filtroLida} onValueChange={setFiltroLida}>
            <SelectTrigger>
              <SelectValue placeholder="Status de leitura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="lida">Lidas</SelectItem>
              <SelectItem value="nao-lida">Não lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicacoesFilters;
