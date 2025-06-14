
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
      case 'Ativo': return { textColor: 'text-emerald-700', bgColor: 'bg-emerald-100', dotColor: 'bg-emerald-500', label: 'Ativo' };
      case 'Inativo': return { textColor: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500', label: 'Inativo' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-gray-700 mt-4 font-medium">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-white/80 backdrop-blur-sm animate-fade-in">
      <Table className="min-w-full">
        <TableHeader className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm">
          <TableRow className="hover:bg-white/10 border-white/20">
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Nome</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider hidden lg:table-cell">Telefone</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">CPF/CNPJ</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-white/20 bg-white/50 backdrop-blur-sm">
          {clients.length > 0 ? (
            clients.map((client, index) => {
              const statusStyle = getStatusStyles(client.status_cliente);
              return (
                <TableRow 
                  key={client.id} 
                  className="hover:bg-white/70 transition-all duration-300 text-left group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm font-semibold text-blue-900 hover:text-indigo-600 cursor-pointer transition-colors duration-200"
                      onClick={() => onView(client)}
                    >
                      {client.nome}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{client.email || '-'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium hidden lg:table-cell">{client.telefone || '-'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{client.tipo_cliente}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium hidden md:table-cell">{client.cpfCnpj || '-'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-1 px-3 font-semibold rounded-full cursor-pointer border-2 transition-all duration-200 hover:scale-105", statusStyle.bgColor, statusStyle.textColor, `border-current shadow-sm`)}
                      onClick={() => onToggleStatus(client)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1.5 h-2 w-2 fill-current", statusStyle.dotColor)} />
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-xl border-white/20 bg-white/95 backdrop-blur-sm">
                        <DropdownMenuItem onClick={() => onView(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 text-left">
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 text-left">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Editar
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
              <TableCell colSpan={7} className="px-6 py-16 text-center text-gray-600">
                <Users className="mx-auto h-12 w-12 text-blue-300 mb-4" />
                <p className="font-semibold text-lg mb-2">Nenhum cliente encontrado.</p>
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
