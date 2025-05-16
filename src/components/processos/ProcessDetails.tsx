
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

interface Process {
  id: string;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

interface ProcessDetailsProps {
  process: Process;
  onClose: () => void;
  onEdit: () => void;
}

const ProcessDetails: React.FC<ProcessDetailsProps> = ({ process, onClose, onEdit }) => {
  return (
    <div className="relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Processo: {process.numero}</h2>
          <Badge
            className={`
              mt-2 ${process.status === "Em andamento" ? "bg-blue-100 text-blue-800" : 
                process.status === "Concluído" ? "bg-green-100 text-green-800" : 
                "bg-yellow-100 text-yellow-800"}`}
          >
            {process.status}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Número do Processo</h3>
            <p className="font-medium">{process.numero}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
            <p className="font-medium">{process.cliente}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tipo de Processo</h3>
            <p className="font-medium">{process.tipo}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Vara</h3>
            <p className="font-medium">{process.vara}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Próximo Prazo</h3>
            <p className="font-medium">{process.prazo}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="font-medium">{process.status}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <Button variant="outline" onClick={onEdit}>
          Editar Processo
        </Button>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default ProcessDetails;
