
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

const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for clients
  const clients = [
    {
      id: 1,
      nome: "João Silva",
      email: "joao.silva@email.com",
      telefone: "(11) 98765-4321",
      tipo: "Pessoa Física",
      processos: 3,
      status: "Ativo"
    },
    {
      id: 2,
      nome: "Empresa ABC Ltda",
      email: "contato@empresaabc.com",
      telefone: "(11) 3456-7890",
      tipo: "Pessoa Jurídica",
      processos: 5,
      status: "Ativo"
    },
    {
      id: 3,
      nome: "Maria Oliveira",
      email: "maria.oliveira@email.com",
      telefone: "(11) 91234-5678",
      tipo: "Pessoa Física",
      processos: 1,
      status: "Inativo"
    },
    {
      id: 4,
      nome: "Carlos Pereira",
      email: "carlos.pereira@email.com",
      telefone: "(11) 97654-3210",
      tipo: "Pessoa Física",
      processos: 2,
      status: "Ativo"
    },
    {
      id: 5,
      nome: "Empresa XYZ S.A.",
      email: "contato@xyz.com",
      telefone: "(11) 2345-6789",
      tipo: "Pessoa Jurídica",
      processos: 7,
      status: "Ativo"
    }
  ];

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Clientes</h1>
        
        {/* Search and Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Buscar clientes..."
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
          <Button>Novo Cliente</Button>
        </div>
        
        {/* Client List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Processos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nome}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.telefone}</TableCell>
                  <TableCell>{client.tipo}</TableCell>
                  <TableCell>{client.processos}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${client.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {client.status}
                    </span>
                  </TableCell>
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

export default ClientesPage;
