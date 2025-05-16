
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AdminLayout from '@/components/AdminLayout';
import ProcessForm from '@/components/ProcessForm';
import { useProcessesStore } from '@/stores/useProcessesStore';
import ProcessTable from '@/components/processos/ProcessTable';
import ProcessDetails from '@/components/processos/ProcessDetails';

// Import Dialog components directly from radix instead of the shadcn wrapper
import * as DialogPrimitive from "@radix-ui/react-dialog";

const MeusProcessosPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    processes,
    addProcess,
    updateProcess,
    toggleProcessStatus,
    deleteProcess,
    getProcessById
  } = useProcessesStore();

  // Debug logging for dialog state
  useEffect(() => {
    console.log("Form dialog state:", isFormOpen);
    console.log("Details dialog state:", isDetailsOpen);
  }, [isFormOpen, isDetailsOpen]);

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use callbacks to ensure functions are stable
  const handleOpenNewProcessForm = useCallback(() => {
    console.log("Add process button clicked - resetting state");
    setSelectedProcess(null);
    setIsEditing(false);
    console.log("Setting isFormOpen to true");
    setIsFormOpen(true);
  }, []);

  const handleSaveProcess = useCallback((processData: any) => {
    if (isEditing && selectedProcess) {
      // Update existing process
      updateProcess(selectedProcess.id, processData);
      
      toast({
        title: "Processo atualizado",
        description: `O processo ${processData.numero} foi atualizado com sucesso.`,
      });
    } else {
      // Add new process
      const newProcess = addProcess({
        ...processData,
        status: processData.status || "Em andamento"
      });
      
      toast({
        title: "Processo cadastrado",
        description: `O processo ${newProcess.numero} foi cadastrado com sucesso.`,
      });
    }
    console.log("Closing form dialog after save");
    setIsFormOpen(false);
  }, [addProcess, isEditing, selectedProcess, toast, updateProcess]);

  const handleEditProcess = useCallback((id: string) => {
    const process = getProcessById(id);
    if (process) {
      console.log("Edit process:", process.id);
      setSelectedProcess(process);
      setIsEditing(true);
      setIsFormOpen(true);
    }
  }, [getProcessById]);

  const handleViewProcess = useCallback((id: string) => {
    const process = getProcessById(id);
    if (process) {
      console.log("View process:", process.id);
      setSelectedProcess(process);
      setIsDetailsOpen(true);
    }
  }, [getProcessById]);

  const handleToggleStatus = useCallback((id: string) => {
    const process = toggleProcessStatus(id);
    
    if (process) {
      const newStatus = process.status;
      toast({
        title: "Status atualizado",
        description: `Processo ${process.numero} agora está ${newStatus}.`
      });
    }
  }, [toggleProcessStatus, toast]);

  const handleDeleteProcess = useCallback((id: string) => {
    const process = getProcessById(id);
    
    if (process && window.confirm(`Tem certeza que deseja excluir o processo ${process.numero}?`)) {
      deleteProcess(id);
      
      toast({
        title: "Processo excluído",
        description: `O processo ${process.numero} foi excluído com sucesso.`,
        variant: "destructive"
      });
    }
  }, [deleteProcess, getProcessById, toast]);

  // Handle dialog changes via explicit functions
  const handleFormOpenChange = useCallback((open: boolean) => {
    console.log("Form dialog openChange event:", open);
    setIsFormOpen(open);
  }, []);

  const handleDetailsOpenChange = useCallback((open: boolean) => {
    console.log("Details dialog openChange event:", open);
    setIsDetailsOpen(open);
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Meus Processos</h1>
        
        {/* Search and Action Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar processo..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Direct button to trigger form - with click handler console logged */}
          <Button 
            onClick={() => {
              console.log("Add button clicked");
              handleOpenNewProcessForm();
            }} 
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Novo Processo
          </Button>
        </div>
        
        {/* Process List Table */}
        <ProcessTable 
          processes={filteredProcesses}
          onEdit={handleEditProcess}
          onView={handleViewProcess}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteProcess}
        />
        
        {/* Process Form Dialog - Using DialogPrimitive directly */}
        <DialogPrimitive.Root 
          open={isFormOpen} 
          onOpenChange={handleFormOpenChange}
        >
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content 
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg overflow-auto max-h-[90vh]"
            >
              <ProcessForm 
                onSave={handleSaveProcess}
                onCancel={() => {
                  console.log("Form cancel clicked");
                  setIsFormOpen(false);
                }}
                process={selectedProcess}
                isEdit={isEditing}
              />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
        
        {/* Process Details Dialog - Using DialogPrimitive directly */}
        <DialogPrimitive.Root 
          open={isDetailsOpen} 
          onOpenChange={handleDetailsOpenChange}
        >
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content 
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"
            >
              {selectedProcess && (
                <ProcessDetails 
                  process={selectedProcess}
                  onClose={() => {
                    console.log("Details close clicked");
                    setIsDetailsOpen(false);
                  }}
                  onEdit={() => {
                    console.log("Details edit clicked");
                    setIsDetailsOpen(false);
                    handleEditProcess(selectedProcess.id);
                  }}
                />
              )}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </AdminLayout>
  );
};

export default MeusProcessosPage;
