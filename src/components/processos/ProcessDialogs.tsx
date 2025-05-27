// src/components/processos/ProcessDialogs.tsx
import React from 'react';
import ProcessForm from '@/components/ProcessForm'; // Certifique-se que este é o formulário principal
import ProcessDetails from '@/components/processos/ProcessDetails'; // Seu componente de detalhes
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { Database } from '@/integrations/supabase/types';
import { ProcessoComCliente } from '@/stores/useProcessesStore'; // Para selectedProcess

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
  selectedProcess: ProcessoComCliente | ProcessoFormDataParaForm | null; // Tipo mais genérico para o form
  isEditing: boolean;
  onFormDialogOpenChange: (open: boolean) => void;
  onDetailsDialogOpenChange: (open: boolean) => void;
  onSaveProcess: (processData: ProcessoFormDataParaForm) => void; // Usa o tipo do form
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
  // O selectedProcess para o formulário já deve estar no formato ProcessoFormDataParaForm
  // O selectedProcess para detalhes deve ser do tipo ProcessoComCliente

  return (
    <>
      {/* Process Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={onFormDialogOpenChange}>
        <DialogContent className="p-0 max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-auto max-h-[90vh]">
          <ProcessForm
            onSave={onSaveProcess as any} // O onSaveProcess em MeusProcessosPage já espera ProcessoFormData
            onCancel={() => onFormDialogOpenChange(false)}
            // @ts-ignore // processoParaEditar em ProcessForm espera um tipo específico
            processoParaEditar={isEditing && formDialogOpen ? selectedProcess : undefined}
            isEdit={isEditing}
            clientesDoUsuario={clientesDoUsuario}
            isLoadingClientes={isLoadingClientes}
          />
        </DialogContent>
      </Dialog>

      {/* Process Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={onDetailsDialogOpenChange}>
        <DialogContent className="p-6 max-w-lg md:max-w-2xl">
          {selectedProcess && detailsDialogOpen && (
            <ProcessDetails
              process={selectedProcess as ProcessoComCliente} // Assegura que é o tipo correto para detalhes
              onClose={() => onDetailsDialogOpenChange(false)}
              onEdit={() => {
                if (selectedProcess?.id) { // Verifica se id existe
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