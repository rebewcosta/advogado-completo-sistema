
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertaPrazo } from '../types/alertTypes';

interface AlertItemProps {
  alerta: AlertaPrazo;
  onMarcarEnviado: (id: string) => void;
  onExcluir: (id: string) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({
  alerta,
  onMarcarEnviado,
  onExcluir
}) => {
  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'critico': return 'bg-red-100 text-red-700 border-red-200';
      case 'urgente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
          <Badge variant="outline" className={getBadgeColor(alerta.tipo_alerta)}>
            {alerta.tipo_alerta.toUpperCase()}
          </Badge>
          {alerta.alerta_enviado && (
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
              ENVIADO
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>{alerta.descricao}</div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Vencimento: {format(new Date(alerta.data_prazo), "dd/MM/yyyy", { locale: ptBR })}</span>
            <span>Criado: {format(new Date(alerta.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
            {alerta.data_envio && (
              <span>Enviado: {format(new Date(alerta.data_envio), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!alerta.alerta_enviado && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarcarEnviado(alerta.id)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Marcar Enviado
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExcluir(alerta.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
