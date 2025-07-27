
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
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
    tipo: 'Receita',
    categoria: '',
    valor: '',
    descricao: '',
    data_transacao: '',
    cliente_associado_id: '',
    processo_associado_id: '',
    status_pagamento: 'Pendente'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transacao) {
      setFormData({
        tipo: transacao.tipo_transacao || 'Receita',
        categoria: transacao.categoria || '',
        valor: transacao.valor?.toString() || '',
        descricao: transacao.descricao || '',
        data_transacao: transacao.data_transacao || '',
        cliente_associado_id: transacao.cliente_associado_id || '',
        processo_associado_id: transacao.processo_associado_id || '',
        status_pagamento: transacao.status_pagamento || 'Pendente'
      });
    } else {
      setFormData({
        tipo: 'Receita',
        categoria: '',
        valor: '',
        descricao: '',
        data_transacao: '',
        cliente_associado_id: '',
        processo_associado_id: '',
        status_pagamento: 'Pendente'
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

  const isMobile = useIsMobile();
  
  // Mobile full-screen dialog
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[9999] bg-white"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100dvh',
              overscrollBehavior: 'contain',
              touchAction: 'manipulation'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {transacao ? 'Editar Transação' : 'Nova Transação'}
                </h2>
                <button onClick={() => onClose()} className="text-white">
                  ✕
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50 p-4"
              style={{
                height: 'calc(100dvh - 140px)',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Copy form content here */}
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-4 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => onClose()}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  {transacao ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl"
        style={{
          touchAction: 'manipulation',
          overscrollBehavior: 'contain'
        }}
      >
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
