// src/components/processos/ProcessDialogs.tsx
import React from 'react';
import ProcessForm from '@/components/ProcessForm'; // Corrigido o caminho para ProcessForm
import ProcessDetails from '@/components/processos/ProcessDetails';
import {
  Dialog,
  DialogContent,
  // DialogOverlay // Removido, pois DialogContent o gerencia
} from "@/components/ui/dialog";
import type { Database } from '@/integrations/supabase/types';

type Processo = Database['public']['Tables']['processos']['Row'];
type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

interface ProcessDialogsProps {
  formDialogOpen: boolean;
  detailsDialogOpen: boolean;
  selectedProcess: any; // Pode ser Processo ou ProcessoFormData
  isEditing: boolean;
  onFormDialogOpenChange: (open: boolean) => void;
  onDetailsDialogOpenChange: (open: boolean) => void;
  onSaveProcess: (processData: any) => void;
  onEditProcess: (id: string) => void; // Adicionado para consistência, embora possa não ser usado diretamente aqui
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
  onEditProcess, // Prop recebida
  clientesDoUsuario,
  isLoadingClientes
}) => {
  console.log("ProcessDialogs: Props recebidas - clientesDoUsuario:", clientesDoUsuario, "isLoadingClientes:", isLoadingClientes, "selectedProcess para form:", formDialogOpen ? selectedProcess : undefined);
  console.log("ProcessDialogs: selectedProcess para detalhes:", detailsDialogOpen ? selectedProcess : undefined);


  return (
    <>
      {/* Process Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={onFormDialogOpenChange}>
        <DialogContent className="p-0 max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-auto max-h-[90vh]">
          <ProcessForm
            onSave={onSaveProcess}
            onCancel={() => onFormDialogOpenChange(false)}
            processoParaEditar={isEditing ? selectedProcess : undefined} // Só passa para edição
            isEdit={isEditing}
            clientesDoUsuario={clientesDoUsuario}
            isLoadingClientes={isLoadingClientes}
          />
        </DialogContent>
      </Dialog>

      {/* Process Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={onDetailsDialogOpenChange}>
        <DialogContent className="p-6 max-w-2xl md:max-w-3xl"> {/* Ajustado max-width */}
          {selectedProcess && ( // Garante que selectedProcess (do tipo Processo) existe para detalhes
            <ProcessDetails
              process={selectedProcess as Processo} // Faz type assertion aqui, pois para detalhes é Processo
              onClose={() => onDetailsDialogOpenChange(false)}
              onEdit={() => {
                onDetailsDialogOpenChange(false); // Fecha detalhes
                onEditProcess(selectedProcess.id); // Chama a função de edição da página pai
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProcessDialogs;