
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProcessForm from '@/components/ProcessForm';
import { X, Edit, Eye, Plus, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminLayout from '@/components/AdminLayout';

interface Process {
  id: string; // Changed from number to string to match the other Process interface
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

const Processos2Page = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProcessDetails, setShowProcessDetails] = useState(false);
  
  // Inicializando com array vazio - persistindo usando localStorage
  const [processes, setProcesses] = useState<Process[]>(() => {
    const savedProcesses = localStorage.getItem('processes2');
    if (savedProcesses) {
      // Convert all 'id' fields from number to string when loading from localStorage
      const parsedProcesses = JSON.parse(savedProcesses);
      return parsedProcesses.map((process: any) => ({
        ...process,
        id: String(process.id) // Ensure id is string
      }));
    }
    return [];
  });

  // Efeito para atualizar localStorage quando os processos mudam
  useEffect(() => {
    localStorage.setItem('processes2', JSON.stringify(processes));
  }, [processes]);

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProcess = () => {
    setSelectedProcess(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleSaveProcess = (processData: any) => {
    if (isEditing && selectedProcess) {
      // Update existing process
      setProcesses(prev => 
        prev.map(process => 
          process.id === selectedProcess.id 
            ? { ...process, ...processData, id: process.id } 
            : process
        )
      );
      toast({
        title: "Processo atualizado",
        description: `O processo ${processData.numero} foi atualizado com sucesso.`,
      });
    } else {
      // Add new process
      const newProcess = {
        ...processData,
        id: Date.now().toString(), // Use timestamp as string for ID
      };
      setProcesses(prev => [...prev, newProcess]);
      toast({
        title: "Processo cadastrado",
        description: `O processo ${newProcess.numero} foi cadastrado com sucesso.`,
      });
    }
    setShowForm(false);
  };

  const handleEditProcess = (process: Process) => {
    setSelectedProcess(process);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewProcess = (process: Process) => {
    setSelectedProcess(process);
    setShowProcessDetails(true);
  };

  const handleToggleStatus = (id: string) => { // Changed from number to string
    setProcesses(prev => 
      prev.map(process => {
        if (process.id === id) {
          let newStatus: 'Em andamento' | 'Concluído' | 'Suspenso';
          
          if (process.status === 'Em andamento') newStatus = 'Concluído';
          else if (process.status === 'Concluído') newStatus = 'Suspenso';
          else newStatus = 'Em andamento';
          
          return { ...process, status: newStatus };
        }
        return process;
      })
    );
    
    const process = processes.find(process => process.id === id);
    const newStatus = process?.status === 'Em andamento' ? 'Concluído' : 
                     process?.status === 'Concluído' ? 'Suspenso' : 'Em andamento';
    
    toast({
      title: "Status atualizado",
      description: `Processo ${process?.numero} agora está ${newStatus}.`
    });
  };

  const handleDeleteProcess = (id: string) => { // Changed from number to string
    const process = processes.find(process => process.id === id);
    
    if (window.confirm(`Tem certeza que deseja excluir o processo ${process?.numero}?`)) {
      setProcesses(prev => prev.filter(process => process.id !== id));
      
      toast({
        title: "Processo excluído",
        description: `O processo ${process?.numero} foi excluído com sucesso.`,
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Processos 2</h1>
        
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
          <Button onClick={handleAddProcess}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>
        
        {/* Process List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vara</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próximo Prazo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.length > 0 ? (
                filteredProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.numero}</TableCell>
                    <TableCell>{process.cliente}</TableCell>
                    <TableCell>{process.tipo}</TableCell>
                    <TableCell>{process.vara}</TableCell>
                    <TableCell>
                      <Badge
                        className={`
                          ${process.status === "Em andamento" ? "bg-blue-100 text-blue-800" : 
                          process.status === "Concluído" ? "bg-green-100 text-green-800" : 
                          "bg-yellow-100 text-yellow-800"}`}
                      >
                        {process.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{process.prazo}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewProcess(process)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditProcess(process)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(process.id)}
                        >
                          Alterar Status
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteProcess(process.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum processo cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
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
            <DialogContent className="max-w-3xl p-6">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Processo: {selectedProcess.numero}</h2>
                    <Badge
                      className={`
                        mt-2 ${selectedProcess.status === "Em andamento" ? "bg-blue-100 text-blue-800" : 
                        selectedProcess.status === "Concluído" ? "bg-green-100 text-green-800" : 
                        "bg-yellow-100 text-yellow-800"}`}
                    >
                      {selectedProcess.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowProcessDetails(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Número do Processo</h3>
                      <p>{selectedProcess.numero}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                      <p>{selectedProcess.cliente}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tipo de Processo</h3>
                      <p>{selectedProcess.tipo}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Vara</h3>
                      <p>{selectedProcess.vara}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Próximo Prazo</h3>
                      <p>{selectedProcess.prazo}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p>{selectedProcess.status}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => {
                    setShowProcessDetails(false);
                    handleEditProcess(selectedProcess);
                  }}>
                    Editar Processo
                  </Button>
                  <Button onClick={() => setShowProcessDetails(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default Processos2Page;
