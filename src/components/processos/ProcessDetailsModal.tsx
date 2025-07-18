
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, DollarSign, Users, Scale, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { useProcessDetails } from '@/hooks/useProcessDetails';
import { ProcessoComCliente } from '@/stores/useProcessesStore';
import ProcessoDetalhes from '@/components/datajud/ProcessoDetalhes';

interface ProcessDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processo: ProcessoComCliente | null;
}

const ProcessDetailsModal: React.FC<ProcessDetailsModalProps> = ({
  open,
  onOpenChange,
  processo
}) => {
  const { isLoading, processDetails, consultarDetalhesProcesso, limparDetalhes } = useProcessDetails();

  React.useEffect(() => {
    if (open && processo?.numero_processo) {
      consultarDetalhesProcesso(processo.numero_processo);
    } else if (!open) {
      limparDetalhes();
    }
  }, [open, processo?.numero_processo]);

  if (!processo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            Detalhes do Processo - {processo.numero_processo}
          </DialogTitle>
          <DialogDescription>
            Informações atualizadas obtidas via DataJud (CNJ) - Consulta gratuita
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Consultando dados atualizados no DataJud...</p>
            <p className="text-sm text-gray-500 mt-2">Esta consulta é gratuita e não consome créditos</p>
          </div>
        ) : processDetails ? (
          <ProcessoDetalhes processo={processDetails} />
        ) : (
          <div className="py-12 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Scale className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dados não encontrados
              </h3>
              <p className="text-gray-600 mb-4">
                Não foi possível encontrar informações atualizadas para este processo no DataJud.
              </p>
              
              {/* Informações básicas do processo local */}
              <Card className="max-w-md mx-auto text-left">
                <CardHeader>
                  <CardTitle className="text-base">Informações Locais</CardTitle>
                  <CardDescription>Dados salvos no seu sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Número do Processo</p>
                    <p className="font-medium">{processo.numero_processo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">{processo.tipo_processo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vara/Tribunal</p>
                    <p className="font-medium">{processo.vara_tribunal || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant="outline">{processo.status_processo}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">
                      {processo.clientes?.nome || processo.nome_cliente_text || 'Não informado'}
                    </p>
                  </div>
                  {processo.proximo_prazo && (
                    <div>
                      <p className="text-sm text-gray-500">Próximo Prazo</p>
                      <p className="font-medium">
                        {new Date(processo.proximo_prazo + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProcessDetailsModal;
