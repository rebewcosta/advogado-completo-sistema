
// src/components/processos/MeusProcessosTable.tsx
import React from 'react';
import { ProcessoComCliente } from '@/stores/useProcessesStore';
import ProcessTable from './ProcessTable';
import { Card, CardContent } from '@/components/ui/card';

interface MeusProcessosTableProps {
  processes: ProcessoComCliente[];
  onEdit: (processo: ProcessoComCliente) => void;
  onView: (processo: ProcessoComCliente) => void;
  onToggleStatus: (processo: ProcessoComCliente) => void;
  onDelete: (processoId: string) => void;
  onViewDetails: (processo: ProcessoComCliente) => void;
  isLoading: boolean;
  searchTerm: string;
}

const MeusProcessosTable: React.FC<MeusProcessosTableProps> = ({
  processes,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  onViewDetails,
  isLoading,
  searchTerm
}) => {
  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <ProcessTable
          processes={processes}
          onEdit={onEdit}
          onView={onView}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </CardContent>
    </Card>
  );
};

export default MeusProcessosTable;
