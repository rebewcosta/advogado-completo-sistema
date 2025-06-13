
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
  ExternalLink 
} from 'lucide-react';

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
    <Card className={`${!publicacao.lida ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{publicacao.titulo_publicacao}</h3>
              {publicacao.segredo_justica && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Segredo
                </Badge>
              )}
              {publicacao.importante && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Star className="h-3 w-3 mr-1" />
                  Importante
                </Badge>
              )}
              {!publicacao.lida && (
                <Badge className="bg-red-100 text-red-700">Nova</Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(parseISO(publicacao.data_publicacao), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {publicacao.estado} {publicacao.comarca && `- ${publicacao.comarca}`}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {publicacao.tipo_publicacao || 'Não especificado'}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              <strong>Diário:</strong> {publicacao.diario_oficial}
            </p>
            
            <p className="text-sm text-gray-600 mb-2">
              <strong>Advogado:</strong> {publicacao.nome_advogado}
            </p>
            
            {publicacao.numero_processo && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Processo:</strong> {publicacao.numero_processo}
              </p>
            )}
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{publicacao.conteudo_publicacao}</p>
            </div>
            
            {publicacao.observacoes && (
              <div className="mt-2 bg-yellow-50 p-2 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Observações:</strong> {publicacao.observacoes}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
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
