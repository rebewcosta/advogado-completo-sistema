import React, { useState } from 'react';
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
import { Search, Eye, Edit, FilePlus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import ProcessForm from '@/components/ProcessForm';
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from "@/components/ui/dialog";

// Interface para tipagem dos processos
interface Process {
  id: string;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

const ProcessosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Lista de processos vazia inicialmente - persistida no localStorage para não perder ao navegar
  const [processes, setProcesses] = useState<Process[]>(() => {
    const savedProcesses = localStorage.getItem('processes');
    return savedProcesses ? JSON.parse(savedProcesses) : [];
  });

  // Salvar processos no localStorage sempre que houver mudanças
  React.useEffect(() => {
    localStorage.setItem('processes', JSON.stringify(processes));
  }, [processes]);

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProcess = (id: string) => {
    const process = processes.find(p => p.id === id);
    if (process) {
      setSelectedProcess(process);
      toast({
        title: "Visualizar processo",
        description: `Visualizando detalhes do processo ${process.numero}`,
      });
    }
  };

  const handleEditProcess = (id: string) => {
    const process = processes.find(p => p.id === id);
    if (process) {
      setSelectedProcess(process);
      setIsEditing(true);
      setShowForm(true);
    }
  };

  const handleNewProcess = () => {
    setSelectedProcess(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleSaveProcess = (processData: Omit<Process, "id">) => {
    if (isEditing && selectedProcess) {
      // Update existing process
      setProcesses(prev => 
        prev.map(process => 
          process.id === selectedProcess.id 
            ? { ...processData, id: process.id } 
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
        id: Date.now().toString(), // Usar timestamp para garantir IDs únicos
      };
      setProcesses(prev => [...prev, newProcess]);
      toast({
        title: "Processo cadastrado",
        description: `O processo ${processData.numero} foi cadastrado com sucesso.`,
      });
    }
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Processos</h1>
        
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
          <Button onClick={handleNewProcess}>
            <FilePlus className="h-4 w-4 mr-2" />
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
                        <Button variant="ghost" size="sm" onClick={() => handleViewProcess(process.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditProcess(process.id)}>
                          <Edit className="h-4 w-4" />
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
      </div>
    </AdminLayout>
  );
};

export default ProcessosPage;
