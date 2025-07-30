
import React from 'react';
import ProcessForm from '@/components/ProcessForm';
import ProcessDetails from '@/components/processos/ProcessDetails';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const isMobile = useIsMobile();

  return (
    <>
      {/* Process Form Dialog */}
      {isMobile ? (
        // Mobile: ProcessForm já renderiza full-screen quando isMobile é true
        formDialogOpen && (
          <ProcessForm
            onSave={onSaveProcess as any}
            onCancel={() => onFormDialogOpenChange(false)}
            // @ts-ignore
            processoParaEditar={isEditing && formDialogOpen ? selectedProcess : undefined}
            isEdit={isEditing}
            clientesDoUsuario={clientesDoUsuario}
            isLoadingClientes={isLoadingClientes}
            onClienteAdded={onClienteAdded}
            onAddNewCliente={() => {}} // Adicionar prop obrigatória
          />
        )
      ) : (
        // Desktop: Usar Dialog normal
        <Dialog open={formDialogOpen} onOpenChange={onFormDialogOpenChange}>
          <DialogContent className="p-0 max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-auto max-h-[90vh]">
            <DialogHeader className="sr-only">
              <DialogTitle>{isEditing ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Atualize as informações do processo' : 'Cadastre um novo processo'}
              </DialogDescription>
            </DialogHeader>
            <ProcessForm
              onSave={onSaveProcess as any}
              onCancel={() => onFormDialogOpenChange(false)}
              // @ts-ignore
              processoParaEditar={isEditing && formDialogOpen ? selectedProcess : undefined}
              isEdit={isEditing}
              clientesDoUsuario={clientesDoUsuario}
              isLoadingClientes={isLoadingClientes}
              onClienteAdded={onClienteAdded}
              onAddNewCliente={() => {}} // Adicionar prop obrigatória
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Process Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={onDetailsDialogOpenChange}>
        <DialogContent className="p-6 max-w-lg md:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Detalhes do Processo</DialogTitle>
            <DialogDescription>Visualize os detalhes completos do processo</DialogDescription>
          </DialogHeader>
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
