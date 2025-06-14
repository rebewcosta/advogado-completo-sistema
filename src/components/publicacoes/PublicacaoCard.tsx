import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  FileText, 
  Shield, 
  Star, 
  Eye, 
  EyeOff, 
  StarOff, 
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Publicacao {
  id: string;
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
  segredo_justica: boolean;
  lida: boolean;
  importante: boolean;
  observacoes?: string;
}

interface PublicacaoCardProps {
  publicacao: Publicacao;
  onToggleLida: (id: string, currentStatus: boolean) => void;
  onToggleImportante: (id: string, currentStatus: boolean) => void;
}

const PublicacaoCard: React.FC<PublicacaoCardProps> = ({
  publicacao,
  onToggleLida,
  onToggleImportante
}) => {
  return (
    <Card className={`${!publicacao.lida ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''} shadow-sm`}>
      <CardContent className="p-3 md:p-4">
        <div className="space-y-3">
          {/* Header com título e badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base md:text-lg leading-tight line-clamp-2">
                {publicacao.titulo_publicacao}
              </h3>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {publicacao.segredo_justica && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Segredo
                  </Badge>
                )}
                {publicacao.importante && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Importante
                  </Badge>
                )}
                {!publicacao.lida && (
                  <Badge className="bg-red-100 text-red-700 text-xs">Nova</Badge>
                )}
              </div>
            </div>
            
            {/* Menu de ações no mobile */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleLida(publicacao.id, publicacao.lida)}>
                    {publicacao.lida ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Marcar não lida
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Marcar como lida
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleImportante(publicacao.id, publicacao.importante)}>
                    {publicacao.importante ? (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Remover importante
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Marcar importante
                      </>
                    )}
                  </DropdownMenuItem>
                  {publicacao.url_publicacao && (
                    <DropdownMenuItem onClick={() => window.open(publicacao.url_publicacao, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver original
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Informações principais */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {format(parseISO(publicacao.data_publicacao), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {publicacao.estado} {publicacao.comarca && `- ${publicacao.comarca}`}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:col-span-2">
                <FileText className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {publicacao.tipo_publicacao || 'Não especificado'}
                </span>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p className="truncate">
                <strong>Diário:</strong> {publicacao.diario_oficial}
              </p>
              <p className="truncate">
                <strong>Advogado:</strong> {publicacao.nome_advogado}
              </p>
              {publicacao.numero_processo && (
                <p className="truncate">
                  <strong>Processo:</strong> {publicacao.numero_processo}
                </p>
              )}
            </div>
          </div>
          
          {/* Conteúdo da publicação */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm line-clamp-4 md:line-clamp-none">{publicacao.conteudo_publicacao}</p>
          </div>
          
          {/* Observações */}
          {publicacao.observacoes && (
            <div className="bg-yellow-50 p-2 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Observações:</strong> {publicacao.observacoes}
              </p>
            </div>
          )}
          
          {/* Botões de ação no desktop */}
          <div className="hidden md:flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleLida(publicacao.id, publicacao.lida)}
            >
              {publicacao.lida ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Marcar não lida
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Marcar como lida
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleImportante(publicacao.id, publicacao.importante)}
            >
              {publicacao.importante ? (
                <>
                  <StarOff className="h-4 w-4 mr-1" />
                  Remover importante
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-1" />
                  Marcar importante
                </>
              )}
            </Button>
            
            {publicacao.url_publicacao && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(publicacao.url_publicacao, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver original
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicacaoCard;
