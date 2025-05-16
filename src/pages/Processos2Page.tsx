
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ProcessForm from '@/components/ProcessForm';
import SearchBar from '@/components/processos/SearchBar';
import ProcessTable from '@/components/processos/ProcessTable';
import ProcessDetails from '@/components/processos/ProcessDetails';
import AdminLayout from '@/components/AdminLayout';
import { useProcessesStore } from '@/stores/useProcessesStore';

const Processos2Page = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProcessDetails, setShowProcessDetails] = useState(false);
  
  // Use the process store instead of local state and localStorage
  const { 
    processes,
    addProcess,
    updateProcess,
    toggleProcessStatus,
    deleteProcess,
    getProcessById
  } = useProcessesStore();

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProcess = selectedProcessId ? getProcessById(selectedProcessId) : null;

  const handleAddProcess = () => {
    setSelectedProcessId(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleSaveProcess = (processData: any) => {
    if (isEditing && selectedProcessId) {
      // Update existing process
      updateProcess(selectedProcessId, processData);
      toast({
        title: "Processo atualizado",
        description: `O processo ${processData.numero} foi atualizado com sucesso.`,
      });
    } else {
      // Add new process
      const newProcess = addProcess(processData);
      toast({
        title: "Processo cadastrado",
        description: `O processo ${newProcess.numero} foi cadastrado com sucesso.`,
      });
    }
    setShowForm(false);
  };

  const handleEditProcess = (id: string) => {
    setSelectedProcessId(id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewProcess = (id: string) => {
    setSelectedProcessId(id);
    setShowProcessDetails(true);
  };

  const handleToggleStatus = (id: string) => {
    const process = toggleProcessStatus(id);
    
    if (process) {
      const newStatus = process.status === 'Em andamento' ? 'Concluído' : 
                       process.status === 'Concluído' ? 'Suspenso' : 'Em andamento';
      
      toast({
        title: "Status atualizado",
        description: `Processo ${process.numero} agora está ${newStatus}.`
      });
    }
  };

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
        <h1 className="text-3xl font-bold mb-6">Processos 2</h1>
        
        {/* Search and Action Bar */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onAddClick={handleAddProcess}
        />
        
        {/* Process Table */}
        <ProcessTable 
          processes={filteredProcesses}
          onEdit={handleEditProcess}
          onView={handleViewProcess}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteProcess}
        />
        
        {/* Process Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl p-0 overflow-auto max-h-[90vh]">
            <ProcessForm 
              onSave={handleSaveProcess}
              onCancel={() => setShowForm(false)}
              process={selectedProcess}
              isEdit={isEditing}
            />
          </DialogContent>
        </Dialog>
        
        {/* Process Details Dialog */}
        {showProcessDetails && selectedProcess && (
          <Dialog open={showProcessDetails} onOpenChange={setShowProcessDetails}>
            <DialogContent className="max-w-3xl p-0">
              <ProcessDetails 
                process={selectedProcess} 
                onClose={() => setShowProcessDetails(false)}
                onEdit={() => {
                  setShowProcessDetails(false);
                  handleEditProcess(selectedProcess.id);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default Processos2Page;
