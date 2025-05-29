
// src/components/processos/ProcessDetails.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, CalendarDays, User, Briefcase, Landmark, Info, CheckCircle, PauseCircle, AlertCircle, FileText, Circle } from 'lucide-react';
import { ProcessoComCliente } from '@/stores/useProcessesStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ProcessDetailsProps {
  process: ProcessoComCliente;
  onClose: () => void;
  onEdit: (processo: ProcessoComCliente) => void; // Passar o objeto completo
}

const ProcessDetails: React.FC<ProcessDetailsProps> = ({ process, onClose, onEdit }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return <span className="text-gray-500">Não definido</span>;
    try {
      const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z';
      return format(parseISO(dateToParse), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return <span className="text-red-500">Data inválida</span>;
    }
  };

  const getStatusStyles = (status?: string | null): {textColor: string, bgColor: string, dotColor: string, label: string, Icon: React.ElementType} => {
    switch (status) {
      case 'Concluído': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Concluído', Icon: CheckCircle };
      case 'Em andamento': return { textColor: 'text-blue-700', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500', label: 'Em Andamento', Icon: Info };
      case 'Suspenso': return { textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500', label: 'Suspenso', Icon: PauseCircle };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D', Icon: AlertCircle };
    }
  };
  
  const statusStyle = getStatusStyles(process.status_processo);

  return (
    <>
      <DialogHeader className="pb-4 mb-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
            <div>
                <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-lawyer-primary" />
                    Detalhes do Processo
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1 ml-7">
                    {process.numero_processo}
                </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </Button>
        </div>
      </DialogHeader>
      
      <div className="space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto pr-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Informações Principais */}
            <InfoItem icon={<statusStyle.Icon className={cn("h-4 w-4", statusStyle.textColor)} />} label="Status" value={
                <Badge variant="outline" className={cn("font-medium", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}>
                    <Circle className={cn("mr-1.5 h-2 w-2 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                    {statusStyle.label}
                </Badge>
            }/>
            <InfoItem icon={<User className="h-4 w-4 text-gray-500"/>} label="Cliente" value={process.clientes?.nome || process.nome_cliente_text || <span className="italic text-gray-400">Não associado</span>}/>
            <InfoItem icon={<Briefcase className="h-4 w-4 text-gray-500"/>} label="Tipo de Processo" value={process.tipo_processo}/>
            <InfoItem icon={<Landmark className="h-4 w-4 text-gray-500"/>} label="Vara/Tribunal" value={process.vara_tribunal || <span className="italic text-gray-400">Não informado</span>}/>
            <InfoItem icon={<CalendarDays className="h-4 w-4 text-gray-500"/>} label="Próximo Prazo" value={formatDate(process.proximo_prazo)}/>
        </div>
        <Separator className="my-4"/>
        <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Datas de Registro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <InfoItem icon={<CalendarDays className="h-4 w-4 text-gray-500"/>} label="Criado em" value={formatDate(process.created_at)}/>
                <InfoItem icon={<CalendarDays className="h-4 w-4 text-gray-500"/>} label="Última Atualização" value={formatDate(process.updated_at)}/>
            </div>
        </div>
      </div>
      
      <DialogFooter className="pt-5 mt-5 border-t border-gray-200 flex-shrink-0">
        <Button variant="outline" onClick={onClose} className="text-gray-700 border-gray-300 hover:bg-gray-100">
          Fechar
        </Button>
        <Button onClick={() => onEdit(process)} className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
          <Edit className="mr-2 h-4 w-4" /> Editar Processo
        </Button>
      </DialogFooter>
    </>
  );
};

// Componente auxiliar para itens de informação
const InfoItem: React.FC<{icon: React.ReactNode, label: string, value: React.ReactNode}> = ({icon, label, value}) => (
    <div className="flex items-start">
        <span className="text-gray-400 mt-0.5 mr-2">{icon}</span>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-gray-700">{value}</p>
        </div>
    </div>
);

export default ProcessDetails;
