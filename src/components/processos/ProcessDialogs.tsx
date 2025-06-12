
// src/components/processos/ProcessDialogs.tsx
import React from 'react';
import ProcessForm from '@/components/ProcessForm';
import ProcessDetails from '@/components/processos/ProcessDetails';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { Database } from '@/integrations/supabase/types';
import { ProcessoComCliente } from '@/stores/useProcessesStore';

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

// Este tipo deve corresponder ao que ProcessForm espera como processoParaEditar
interface ProcessoFormDataParaForm {
  id?: string;
  numero: string;
  cliente_id: string | null;
  nome_cliente_text?: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string; // Formato dd/MM/yyyy
}

interface ProcessDialogsProps {
  formDialogOpen: boolean;
  detailsDialogOpen: boolean;
  selectedProcess: ProcessoComCliente | ProcessoFormDataParaForm | null;
  isEditing: boolean;
  onFormDialogOpenChange: (open: boolean) => void;
  onDetailsDialogOpenChange: (open: boolean) => void;
  onSaveProcess: (processData: ProcessoFormDataParaForm) => void;
  onEditProcess: (id: string) => void;
  clientesDoUsuario: ClienteParaSelect[];
  isLoadingClientes: boolean;
  onClienteAdded?: () => void; // Adicionar prop para callback
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
  isLoadingClientes,
  onClienteAdded // Adicionar prop
}) => {
  return (
    <>
      {/* Process Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={onFormDialogOpenChange}>
        <DialogContent className="p-0 max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-auto max-h-[90vh]">
          <ProcessForm
            onSave={onSaveProcess as any}
            onCancel={() => onFormDialogOpenChange(false)}
            // @ts-ignore
            processoParaEditar={isEditing && formDialogOpen ? selectedProcess : undefined}
            isEdit={isEditing}
            clientesDoUsuario={clientesDoUsuario}
            isLoadingClientes={isLoadingClientes}
            onClienteAdded={onClienteAdded} // Passar callback
          />
        </DialogContent>
      </Dialog>

      {/* Process Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={onDetailsDialogOpenChange}>
        <DialogContent className="p-6 max-w-lg md:max-w-2xl">
          {selectedProcess && detailsDialogOpen && (
            <ProcessDetails
              process={selectedProcess as ProcessoComCliente}
              onClose={() => onDetailsDialogOpenChange(false)}
              onEdit={() => {
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
