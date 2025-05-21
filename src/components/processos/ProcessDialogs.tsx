
// src/components/processos/ProcessDialogs.tsx
import React from 'react';
import ProcessForm from '@/components/ProcessForm';
import ProcessDetails from '@/components/processos/ProcessDetails';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { Database } from '@/integrations/supabase/types';

type Processo = Database['public']['Tables']['processos']['Row'];
type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

// Define the interface for ProcessDetails component to match the type it expects
interface ProcessFormData {
  id?: string;
  numero: string;
  cliente_id: string | null;
  nome_cliente_text?: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
  cliente?: any;
}

interface ProcessDialogsProps {
  formDialogOpen: boolean;
  detailsDialogOpen: boolean;
  selectedProcess: Processo | ProcessFormData | null;
  isEditing: boolean;
  onFormDialogOpenChange: (open: boolean) => void;
  onDetailsDialogOpenChange: (open: boolean) => void;
  onSaveProcess: (processData: ProcessFormData) => void;
  onEditProcess: (id: string) => void;
  clientesDoUsuario: ClienteParaSelect[];
  isLoadingClientes: boolean;
}

const ProcessDialogs: React.FC<ProcessDialogsProps> = ({
  formDialogOpen,
  detailsDialogOpen,
  selectedProcess,
  isEditing,
  onFormDialogOpenChange,
  onDetailsDialogOpenChange,
  onSaveProcess,
  onEditProcess,
  clientesDoUsuario,
  isLoadingClientes
}) => {
  console.log("ProcessDialogs: Props recebidas - clientesDoUsuario:", clientesDoUsuario, "isLoadingClientes:", isLoadingClientes, "selectedProcess para form:", formDialogOpen ? selectedProcess : undefined);
  console.log("ProcessDialogs: selectedProcess para detalhes:", detailsDialogOpen ? selectedProcess : undefined);

  // Map the selected process to expected Process type for ProcessDetails if needed
  const mapToProcessType = (process: any): any => {
    // Only do the mapping if we're displaying details and the process needs conversion
    if (detailsDialogOpen && process) {
      return {
        ...process,
        numero: process.numero || process.numero_processo,
        tipo: process.tipo || process.tipo_processo,
        vara: process.vara || process.vara_tribunal,
        status: process.status || process.status_processo,
      };
    }
    return process;
  };

  const processForDetails = mapToProcessType(selectedProcess);

  return (
    <>
      {/* Process Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={onFormDialogOpenChange}>
        <DialogContent className="p-0 max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-auto max-h-[90vh]">
          <ProcessForm
            onSave={onSaveProcess}
            onCancel={() => onFormDialogOpenChange(false)}
            processoParaEditar={isEditing ? selectedProcess : undefined}
            isEdit={isEditing}
            clientesDoUsuario={clientesDoUsuario}
            isLoadingClientes={isLoadingClientes}
          />
        </DialogContent>
      </Dialog>

      {/* Process Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={onDetailsDialogOpenChange}>
        <DialogContent className="p-6 max-w-2xl md:max-w-3xl">
          {selectedProcess && (
            <ProcessDetails
              process={processForDetails}
              onClose={() => onDetailsDialogOpenChange(false)}
              onEdit={() => {
                onDetailsDialogOpenChange(false);
                if (selectedProcess?.id) {
                  onEditProcess(selectedProcess.id);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProcessDialogs;
