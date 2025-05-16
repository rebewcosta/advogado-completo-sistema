
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
import { X, Edit, Eye } from 'lucide-react';

interface Process {
  id: string;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

interface ProcessTableProps {
  processes: Process[];
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProcessTable: React.FC<ProcessTableProps> = ({
  processes,
  onEdit,
  onView,
  onToggleStatus,
  onDelete
}) => {
  return (
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
          {processes.length > 0 ? (
            processes.map((process) => (
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
                    <Button variant="ghost" size="sm" onClick={() => onView(process.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(process.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onToggleStatus(process.id)}
                    >
                      Alterar Status
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(process.id)}
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
  );
};

export default ProcessTable;
