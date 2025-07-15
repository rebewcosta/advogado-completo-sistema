
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

  // Debug para mobile - verificar se os avisos estão sendo carregados
  React.useEffect(() => {
    console.log('🔔 [ListaAvisos] Avisos não lidos carregados:', {
      total: avisosNaoLidos.length,
      avisos: avisosNaoLidos.map(a => ({ id: a.id, titulo: a.titulo, prioridade: a.prioridade })),
      dispensados: avisosDispensados,
      mostrarAvisos
    });
  }, [avisosNaoLidos, avisosDispensados, mostrarAvisos]);

  const avisosVisiveis = avisosNaoLidos.filter(aviso => 
    !avisosDispensados.includes(aviso.id)
  );

  const handleDismiss = (avisoId: string) => {
    console.log('🔔 [ListaAvisos] Dispensando aviso:', avisoId);
    setAvisosDispensados(prev => [...prev, avisoId]);
  };

  const toggleAvisos = () => {
    console.log('🔔 [ListaAvisos] Toggle avisos:', !mostrarAvisos);
    setMostrarAvisos(!mostrarAvisos);
  };

  // Debug: sempre mostrar pelo menos um log para confirmar que o componente está renderizando
  console.log('🔔 [ListaAvisos] Renderizando componente - Avisos visíveis:', avisosVisiveis.length);

  if (avisosVisiveis.length === 0) {
    console.log('🔔 [ListaAvisos] Nenhum aviso visível - componente não será exibido');
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] md:max-w-[90vw]">
      <div className="mb-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAvisos}
          className="flex items-center gap-2 shadow-lg"
        >
          {mostrarAvisos ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          <Badge variant="secondary" className="ml-1">
            {avisosVisiveis.length}
          </Badge>
        </Button>
      </div>
      
      {mostrarAvisos && (
        <div className="max-h-[70vh] md:max-h-[80vh] overflow-y-auto space-y-2">
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
