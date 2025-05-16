
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import AdminLayout from '@/components/AdminLayout';
import { useProcessesStore } from '@/stores/useProcessesStore';
import ProcessesPageContent from '@/components/processos/ProcessesPageContent';

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

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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
      <ProcessesPageContent
        processes={filteredProcesses}
        searchTerm={searchTerm}
        formDialogOpen={formDialogOpen}
        detailsDialogOpen={detailsDialogOpen}
        selectedProcess={selectedProcess}
        isEditing={isEditing}
        onSearchChange={handleSearchChange}
        onFormDialogOpenChange={setFormDialogOpen}
        onDetailsDialogOpenChange={setDetailsDialogOpen}
        onNewProcess={handleOpenNewProcessForm}
        onEditProcess={handleEditProcess}
        onViewProcess={handleViewProcess}
        onToggleStatus={handleToggleStatus}
        onDeleteProcess={handleDeleteProcess}
        onSaveProcess={handleSaveProcess}
      />
    </AdminLayout>
  );
};

export default MeusProcessosPage;
