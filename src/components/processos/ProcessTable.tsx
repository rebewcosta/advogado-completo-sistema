// src/components/processos/ProcessTable.tsx
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
import { X, Edit, Eye } from 'lucide-react'; // Adicionado para os botões
import type { ProcessoComCliente } from '@/stores/useProcessesStore'; // Importando o tipo

interface ProcessTableProps {
  processes: ProcessoComCliente[]; // Usando o tipo ProcessoComCliente
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
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    // A data do Supabase (tipo 'date') vem como 'YYYY-MM-DD'
    // Adicionar 'T00:00:00Z' para tratar como UTC e evitar problemas de fuso ao converter para o local
    try {
        const date = new Date(dateString + 'T00:00:00Z');
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Exibe como dd/MM/yyyy
    } catch (e) {
        return dateString; // Retorna a string original se houver erro na formatação
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto"> {/* Adicionado shadow-md */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Vara</TableHead> {/* Ocultar em telas menores */}
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Próximo Prazo</TableHead> {/* Ocultar em telas muito pequenas */}
            <TableHead className="text-right">Ações</TableHead> {/* Ações sempre à direita */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.length > 0 ? (
            processes.map((process) => (
              <TableRow key={process.id} className="hover:bg-gray-50">
                <TableCell className="font-medium py-3 px-4">{process.numero_processo}</TableCell>
                <TableCell className="py-3 px-4">{process.nome_cliente_text || '-'}</TableCell> {/* Usar nome_cliente_text */}
                <TableCell className="py-3 px-4">{process.tipo_processo}</TableCell>
                <TableCell className="hidden md:table-cell py-3 px-4">{process.vara_tribunal || '-'}</TableCell>
                <TableCell className="py-3 px-4">
                  <Badge
                    className={`
                      ${process.status_processo === "Em andamento" ? "bg-blue-100 text-blue-700" :
                        process.status_processo === "Concluído" ? "bg-green-100 text-green-700" :
                        "bg-yellow-100 text-yellow-700"}
                        whitespace-nowrap px-2 py-1 text-xs
                    `}
                  >
                    {process.status_processo}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell py-3 px-4">{formatDate(process.proximo_prazo)}</TableCell>
                <TableCell className="text-right py-3 px-4">
                  <div className="flex justify-end space-x-1 md:space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(process.id)} title="Ver Detalhes">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(process.id)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(process.id)}
                      className="hidden sm:inline-flex" // Ocultar em telas muito pequenas
                      title="Alterar Status"
                    >
                      Alterar Status
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(process.id)}
                      title="Excluir"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500"> {/* Ajustado colSpan */}
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