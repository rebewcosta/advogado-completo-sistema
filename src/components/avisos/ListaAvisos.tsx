
import React, { useState } from 'react';
import { useAvisos } from '@/hooks/useAvisos';
import AvisoNotificacao from './AvisoNotificacao';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ListaAvisos = () => {
  const { avisosNaoLidos, marcarComoLido } = useAvisos();
  const [avisosDispensados, setAvisosDispensados] = useState<string[]>([]);
  const [mostrarAvisos, setMostrarAvisos] = useState(true);

  const avisosVisiveis = avisosNaoLidos.filter(aviso => 
    !avisosDispensados.includes(aviso.id)
  );

  const handleDismiss = (avisoId: string) => {
    setAvisosDispensados(prev => [...prev, avisoId]);
  };

  const toggleAvisos = () => {
    setMostrarAvisos(!mostrarAvisos);
  };

  if (avisosVisiveis.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[90vw]">
      <div className="mb-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAvisos}
          className="flex items-center gap-2"
        >
          {mostrarAvisos ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          <Badge variant="secondary" className="ml-1">
            {avisosVisiveis.length}
          </Badge>
        </Button>
      </div>
      
      {mostrarAvisos && (
        <div className="max-h-[80vh] overflow-y-auto space-y-2">
          {avisosVisiveis.map((aviso) => (
            <AvisoNotificacao
              key={aviso.id}
              aviso={aviso}
              onMarcarComoLido={marcarComoLido}
              onDismiss={() => handleDismiss(aviso.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaAvisos;
