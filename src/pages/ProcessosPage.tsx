
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
import { Search, Eye, Edit } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";

const ProcessosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Lista vazia de processos
  const processes = [];

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProcess = (id) => {
    toast({
      title: "Visualizar processo",
      description: `Visualizando detalhes do processo ${id}`,
    });
  };

  const handleEditProcess = (id) => {
    toast({
      title: "Editar processo",
      description: `Editando informações do processo ${id}`,
    });
  };

  const handleNewProcess = () => {
    toast({
      title: "Novo processo",
      description: "Formulário para cadastro de novo processo aberto",
    });
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
            <span className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Processo
            </span>
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
                    Nenhum processo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProcessosPage;
