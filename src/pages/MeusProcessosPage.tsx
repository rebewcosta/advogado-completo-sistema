
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Edit, Eye, Plus, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogOverlay
} from "@/components/ui/dialog";
import AdminLayout from '@/components/AdminLayout';
import ProcessForm from '@/components/ProcessForm';
import { useProcessesStore } from '@/stores/useProcessesStore';
import ProcessTable from '@/components/processos/ProcessTable';
import SearchBar from '@/components/processos/SearchBar';
import ProcessDetails from '@/components/processos/ProcessDetails';

const MeusProcessosPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProcessDetails, setShowProcessDetails] = useState(false);
  
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
    process.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProcess = () => {
    setSelectedProcess(null);
    setIsEditing(false);
    setShowForm(true);
  };

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
    setShowForm(false);
  };

  const handleEditProcess = (id: string) => {
    const process = getProcessById(id);
    if (process) {
      setSelectedProcess(process);
      setIsEditing(true);
      setShowForm(true);
    }
  };

  const handleViewProcess = (id: string) => {
    const process = getProcessById(id);
    if (process) {
      setSelectedProcess(process);
      setShowProcessDetails(true);
    }
  };

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
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onAddClick={handleAddProcess}
        />
        
        {/* Process List */}
        <ProcessTable 
          processes={filteredProcesses}
          onEdit={handleEditProcess}
          onView={handleViewProcess}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteProcess}
        />
        
        {/* Process Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogOverlay />
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
        <Dialog open={showProcessDetails} onOpenChange={setShowProcessDetails}>
          <DialogOverlay />
          <DialogContent className="max-w-3xl p-6">
            {selectedProcess && (
              <ProcessDetails 
                process={selectedProcess}
                onClose={() => setShowProcessDetails(false)}
                onEdit={() => {
                  setShowProcessDetails(false);
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
