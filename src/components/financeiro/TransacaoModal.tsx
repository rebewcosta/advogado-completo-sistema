
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import TransacaoFormHeader from './TransacaoFormHeader';
import TransacaoFormFields from './TransacaoFormFields';
import TransacaoFormActions from './TransacaoFormActions';

interface TransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transacaoData: any) => Promise<boolean>;
  transacao?: any;
}

const TransacaoModal: React.FC<TransacaoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transacao
}) => {
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    categoria: '',
    valor: '',
    descricao: '',
    data_transacao: '',
    cliente_associado_id: '',
    processo_associado_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transacao) {
      setFormData({
        tipo: transacao.tipo || 'entrada',
        categoria: transacao.categoria || '',
        valor: transacao.valor?.toString() || '',
        descricao: transacao.descricao || '',
        data_transacao: transacao.data_transacao || '',
        cliente_associado_id: transacao.cliente_associado_id || '',
        processo_associado_id: transacao.processo_associado_id || ''
      });
    } else {
      setFormData({
        tipo: 'entrada',
        categoria: '',
        valor: '',
        descricao: '',
        data_transacao: '',
        cliente_associado_id: '',
        processo_associado_id: ''
      });
    }
  }, [transacao, isOpen]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const transacaoData = {
        ...formData,
        valor: parseFloat(formData.valor) || 0
      };
      
      const success = await onSave(transacaoData);
      if (success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl">
        <div className="h-full flex flex-col rounded-xl overflow-hidden">
          <TransacaoFormHeader isEdit={!!transacao} onClose={onClose} />
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <TransacaoFormFields 
              formData={formData} 
              onChange={handleFieldChange}
            />
            <TransacaoFormActions isEdit={!!transacao} onCancel={onClose} isLoading={isLoading} />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransacaoModal;
