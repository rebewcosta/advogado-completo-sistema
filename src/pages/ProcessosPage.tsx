
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
  
  // Lista de processos mock
  const processes: Process[] = [
    {
      id: "proc-1",
      numero: "0001234-56.2023.8.26.0000",
      cliente: "Empresa ABC Ltda",
      tipo: "Cível",
      vara: "2ª Vara Cível",
      status: "Em andamento",
      prazo: "15/07/2025",
    },
    {
      id: "proc-2",
      numero: "0002345-67.2023.8.26.0000",
      cliente: "João Silva",
      tipo: "Trabalhista",
      vara: "5ª Vara do Trabalho",
      status: "Em andamento",
      prazo: "22/06/2025",
    },
    {
      id: "proc-3",
      numero: "0003456-78.2023.8.26.0000",
      cliente: "Maria Oliveira",
      tipo: "Família",
      vara: "1ª Vara de Família",
      status: "Em andamento",
      prazo: "30/06/2025",
    },
    {
      id: "proc-4",
      numero: "0004567-89.2023.8.26.0000",
      cliente: "Pedro Santos",
      tipo: "Tributário",
      vara: "Vara da Fazenda Pública",
      status: "Em andamento",
      prazo: "10/07/2025",
    },
    {
      id: "proc-5",
      numero: "0005678-90.2023.8.26.0000",
      cliente: "Empresa XYZ S.A.",
      tipo: "Criminal",
      vara: "3ª Vara Criminal",
      status: "Em andamento",
      prazo: "05/07/2025",
    },
    {
      id: "proc-6",
      numero: "0006789-01.2023.8.26.0000",
      cliente: "Empresa ABC Ltda",
      tipo: "Trabalhista",
      vara: "2ª Vara do Trabalho",
      status: "Em andamento",
      prazo: "18/06/2025",
    },
    {
      id: "proc-7",
      numero: "0007890-12.2022.8.26.0000",
      cliente: "João Silva",
      tipo: "Cível",
      vara: "4ª Vara Cível",
      status: "Concluído",
      prazo: "Concluído em 10/05/2025",
    },
    {
      id: "proc-8",
      numero: "0008901-23.2022.8.26.0000",
      cliente: "Maria Oliveira",
      tipo: "Cível",
      vara: "1ª Vara Cível",
      status: "Concluído",
      prazo: "Concluído em 05/05/2025",
    }
  ];

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.tipo.toLowerCase().includes(searchTerm.toLowerCase())
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
