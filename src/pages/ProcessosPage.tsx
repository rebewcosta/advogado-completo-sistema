
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
import { Search, Eye, Edit, Plus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Definição do tipo de processo
interface Processo {
  id: number;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: string;
  prazo: string;
}

const ProcessosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [processos, setProcessos] = useState<Processo[]>([]);

  // Filtrar processos com base no termo de pesquisa
  const filteredProcessos = processos.filter(processo =>
    processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProcess = (id: number) => {
    toast({
      title: "Visualizando processo",
      description: `Detalhes do processo ${id} estão sendo carregados.`
    });
    // Em uma implementação real, isso navegaria para a página de detalhes
    // navigate(`/processos/${id}`);
  };

  const handleEditProcess = (id: number) => {
    toast({
      title: "Editando processo",
      description: `Formulário de edição do processo ${id} aberto.`
    });
    // Em uma implementação real, isso abriria um modal ou navegaria para uma página de edição
  };

  const handleNewProcess = () => {
    toast({
      title: "Novo processo",
      description: "Formulário para cadastro de novo processo aberto."
    });
    // Em uma implementação real, isso abriria um modal ou navegaria para uma página de criação
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
              {filteredProcessos.length > 0 ? (
                filteredProcessos.map((processo) => (
                  <TableRow key={processo.id}>
                    <TableCell className="font-medium">{processo.numero}</TableCell>
                    <TableCell>{processo.cliente}</TableCell>
                    <TableCell>{processo.tipo}</TableCell>
                    <TableCell>{processo.vara}</TableCell>
                    <TableCell>
                      <Badge
                        className={`
                          ${processo.status === "Em andamento" ? "bg-blue-100 text-blue-800" : 
                            processo.status === "Concluído" ? "bg-green-100 text-green-800" :
                            "bg-yellow-100 text-yellow-800"}`}
                      >
                        {processo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{processo.prazo}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewProcess(processo.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditProcess(processo.id)}>
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
