
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
import Sidebar from "@/components/ui/sidebar";

const ProcessosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for processes
  const processes = [
    {
      id: 1,
      numero: "0001234-56.2023.8.26.0100",
      cliente: "João Silva",
      tipo: "Cível",
      vara: "3ª Vara Cível",
      status: "Em andamento",
      prazo: "2025-06-15"
    },
    {
      id: 2,
      numero: "0007890-12.2023.8.26.0100",
      cliente: "Empresa ABC Ltda",
      tipo: "Trabalhista",
      vara: "2ª Vara do Trabalho",
      status: "Concluído",
      prazo: "2025-05-10"
    },
    {
      id: 3,
      numero: "0003456-78.2022.8.26.0100",
      cliente: "Maria Oliveira",
      tipo: "Família",
      vara: "1ª Vara de Família",
      status: "Em andamento",
      prazo: "2025-07-20"
    },
    {
      id: 4,
      numero: "0009012-34.2023.8.26.0100",
      cliente: "Carlos Pereira",
      tipo: "Cível",
      vara: "5ª Vara Cível",
      status: "Em andamento",
      prazo: "2025-06-30"
    },
    {
      id: 5,
      numero: "0005678-90.2022.8.26.0100",
      cliente: "Empresa XYZ S.A.",
      tipo: "Tributário",
      vara: "2ª Vara de Fazenda Pública",
      status: "Suspenso",
      prazo: "2025-08-05"
    }
  ];

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process =>
    process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
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
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <Button>Novo Processo</Button>
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
              {filteredProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-medium">{process.numero}</TableCell>
                  <TableCell>{process.cliente}</TableCell>
                  <TableCell>{process.tipo}</TableCell>
                  <TableCell>{process.vara}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${process.status === "Em andamento" ? "bg-blue-100 text-blue-800" : 
                          process.status === "Concluído" ? "bg-green-100 text-green-800" :
                          "bg-yellow-100 text-yellow-800"}`}
                    >
                      {process.status}
                    </span>
                  </TableCell>
                  <TableCell>{process.prazo}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ProcessosPage;
