
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProcessForm from '@/components/ProcessForm';
import { Plus, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AdminLayout from '@/components/AdminLayout';
import { useProcessesStore } from '@/stores/useProcessesStore';
import ProcessDetails from '@/components/processos/ProcessDetails';
import ProcessTable from '@/components/processos/ProcessTable';
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from "@/components/ui/dialog";

const MeusProcessosPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
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

  // Debugging logs
  useEffect(() => {
    console.log("==== PAGE RENDER ====");
    console.log("formDialogOpen:", formDialogOpen);
    console.log("detailsDialogOpen:", detailsDialogOpen);
    console.log("selectedProcess:", selectedProcess);
    console.log("isEditing:", isEditing);
  }, [formDialogOpen, detailsDialogOpen, selectedProcess, isEditing]);

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open form for new process
  const handleOpenNewProcessForm = () => {
    console.log("Opening new process form");
    setSelectedProcess(null);
    setIsEditing(false);
    setFormDialogOpen(true);
  };

  // Handle save process
  const handleSaveProcess = (processData: any) => {
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
    
    setFormDialogOpen(false);
  };

  // Handle edit process
  const handleEditProcess = (id: string) => {
    console.log("Edit process button clicked for id:", id);
    const process = getProcessById(id);
    if (process) {
      setSelectedProcess(process);
      setIsEditing(true);
      setFormDialogOpen(true);
    }
  };

  // Handle view process
  const handleViewProcess = (id: string) => {
    console.log("View process button clicked for id:", id);
    const process = getProcessById(id);
    if (process) {
      setSelectedProcess(process);
      setDetailsDialogOpen(true);
    }
  };

  // Handle toggle status
  const handleToggleStatus = (id: string) => {
    const process = toggleProcessStatus(id);
    
    if (process) {
      const newStatus = process.status;
      toast({
        title: "Status atualizado",
        description: `Processo ${process.numero} agora está ${newStatus}.`
      });
    }
  };

  // Handle delete process
  const handleDeleteProcess = (id: string) => {
    const process = getProcessById(id);
    
    if (process && window.confirm(`Tem certeza que deseja excluir o processo ${process.numero}?`)) {
      deleteProcess(id);
      
      toast({
        title: "Processo excluído",
        description: `O processo ${process.numero} foi excluído com sucesso.`,
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Meus Processos</h1>
        
        {/* Search and Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Buscar processos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <Button onClick={handleOpenNewProcessForm}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>
        
        {/* Process Table */}
        <ProcessTable 
          processes={filteredProcesses}
          onEdit={handleEditProcess}
          onView={handleViewProcess}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteProcess}
        />
        
        {/* Process Form Dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogOverlay className="bg-black/30" />
          <DialogContent className="p-0 max-w-4xl overflow-auto max-h-[90vh]">
            <ProcessForm 
              onSave={handleSaveProcess}
              onCancel={() => setFormDialogOpen(false)}
              process={selectedProcess}
              isEdit={isEditing}
            />
          </DialogContent>
        </Dialog>
        
        {/* Process Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogOverlay className="bg-black/30" />
          <DialogContent className="p-6 max-w-3xl">
            {selectedProcess && (
              <ProcessDetails 
                process={selectedProcess} 
                onClose={() => setDetailsDialogOpen(false)}
                onEdit={() => {
                  setDetailsDialogOpen(false);
                  handleEditProcess(selectedProcess.id);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MeusProcessosPage;
