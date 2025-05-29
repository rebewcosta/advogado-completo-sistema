// src/components/clientes/ClienteTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, Users, Mail, Phone, Building } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import type { Database } from '@/integrations/supabase/types';

type Cliente = Database['public']['Tables']['clientes']['Row'];

interface ClienteTableProps {
  clients: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onView: (cliente: Cliente) => void;
  onToggleStatus: (cliente: Cliente) => void;
  onDelete: (clienteId: string) => void;
  isLoading: boolean;
  searchTerm: string;
}

const ClienteTable: React.FC<ClienteTableProps> = ({
  clients,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  isLoading,
  searchTerm
}) => {

  const getStatusStyles = (status?: string | null): {textColor: string, bgColor: string, dotColor: string, label: string} => {
    switch (status) {
      case 'Ativo': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Ativo' };
      case 'Inativo': return { textColor: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500', label: 'Inativo' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-3">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200/80 shadow-md bg-white">
      <Table className="min-w-full">
        <TableHeader className="bg-lawyer-dark">
          <TableRow className="hover:bg-lawyer-dark/90">
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Nome</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Email</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden lg:table-cell">Telefone</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">CPF/CNPJ</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200/70">
          {clients.length > 0 ? (
            clients.map((client) => {
              const statusStyle = getStatusStyles(client.status_cliente);
              return (
                <TableRow key={client.id} className="hover:bg-gray-50/60 transition-colors text-left">
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer"
                      onClick={() => onView(client)}
                    >
                      {client.nome}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{client.email || '-'}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">{client.telefone || '-'}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{client.tipo_cliente}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{client.cpfCnpj || '-'}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-0.5 px-2 font-medium rounded-full cursor-pointer", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}
                      onClick={() => onToggleStatus(client)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-lg">
                        <DropdownMenuItem onClick={() => onView(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(client.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 text-left"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="px-6 py-16 text-center text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium mb-1">Nenhum cliente encontrado.</p>
                <p className="text-sm">
                  {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Novo Cliente\" para adicionar."}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClienteTable;