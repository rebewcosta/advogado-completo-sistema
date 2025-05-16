
import React from 'react';
import ProcessForm from '@/components/ProcessForm';
import ProcessDetails from '@/components/processos/ProcessDetails';
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from "@/components/ui/dialog";

interface Process {
  id: string;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

interface ProcessDialogsProps {
  formDialogOpen: boolean;
  detailsDialogOpen: boolean;
  selectedProcess: Process | null;
  isEditing: boolean;
  onFormDialogOpenChange: (open: boolean) => void;
  onDetailsDialogOpenChange: (open: boolean) => void;
  onSaveProcess: (processData: any) => void;
  onEditProcess: (id: string) => void;
}

const ProcessDialogs: React.FC<ProcessDialogsProps> = ({
  formDialogOpen,
  detailsDialogOpen,
  selectedProcess,
  isEditing,
  onFormDialogOpenChange,
  onDetailsDialogOpenChange,
  onSaveProcess,
  onEditProcess
}) => {
  return (
    <>
      {/* Process Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={onFormDialogOpenChange}>
        <DialogOverlay className="bg-black/30" />
        <DialogContent className="p-0 max-w-4xl overflow-auto max-h-[90vh]">
          <ProcessForm 
            onSave={onSaveProcess}
            onCancel={() => onFormDialogOpenChange(false)}
            process={selectedProcess}
            isEdit={isEditing}
          />
        </DialogContent>
      </Dialog>
      
      {/* Process Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={onDetailsDialogOpenChange}>
        <DialogOverlay className="bg-black/30" />
        <DialogContent className="p-6 max-w-3xl">
          {selectedProcess && (
            <ProcessDetails 
              process={selectedProcess} 
              onClose={() => onDetailsDialogOpenChange(false)}
              onEdit={() => {
                onDetailsDialogOpenChange(false);
                onEditProcess(selectedProcess.id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProcessDialogs;
