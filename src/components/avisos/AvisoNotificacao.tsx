
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { AvisoNaoLido } from '@/types/avisos';
import { cn } from '@/lib/utils';

interface AvisoNotificacaoProps {
  aviso: AvisoNaoLido;
  onMarcarComoLido: (avisoId: string) => void;
  onDismiss: () => void;
}

const getAvisoIcon = (tipo: string) => {
  switch (tipo) {
    case 'warning':
      return AlertTriangle;
    case 'error':
      return AlertCircle;
    case 'success':
      return CheckCircle;
    default:
      return Info;
  }
};

const getAvisoVariant = (tipo: string) => {
  switch (tipo) {
    case 'error':
      return 'destructive';
    default:
      return 'default';
  }
};

const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case 'critica':
      return 'border-red-500 bg-red-50 dark:bg-red-950';
    case 'alta':
      return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
    case 'normal':
      return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    case 'baixa':
      return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
    default:
      return '';
  }
};

const AvisoNotificacao = ({ aviso, onMarcarComoLido, onDismiss }: AvisoNotificacaoProps) => {
  const Icon = getAvisoIcon(aviso.tipo);
  const variant = getAvisoVariant(aviso.tipo);
  const prioridadeColor = getPrioridadeColor(aviso.prioridade);

  return (
    <Alert 
      variant={variant}
      className={cn(
        "mb-4 border-l-4 shadow-lg animate-in slide-in-from-top-2 duration-300",
        "w-full max-w-none", // Garante que ocupe toda a largura disponível
        prioridadeColor
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <AlertTitle className="flex items-start justify-between gap-2">
          <span className="flex-1 text-sm md:text-base font-semibold leading-tight">
            {aviso.titulo}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap",
              aviso.prioridade === 'critica' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
              aviso.prioridade === 'alta' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
              aviso.prioridade === 'normal' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
              aviso.prioridade === 'baixa' && "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            )}>
              {aviso.prioridade}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </AlertTitle>
        <AlertDescription className="mt-2 text-xs md:text-sm text-left leading-relaxed">
          {aviso.mensagem}
        </AlertDescription>
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            onClick={() => onMarcarComoLido(aviso.id)}
            className="text-xs px-3 py-1"
          >
            Marcar como lido
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default AvisoNotificacao;
