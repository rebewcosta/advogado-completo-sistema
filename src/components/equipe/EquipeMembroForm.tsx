
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from "@/components/ui/button";
import EquipeMembroFormFields from './EquipeMembroFormFields';
import EquipeMembroFormActions from './EquipeMembroFormActions';

interface EquipeMembroFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (membroData: any) => Promise<boolean>;
  membro?: any;
}

const EquipeMembroForm: React.FC<EquipeMembroFormProps> = ({
  isOpen,
  onClose,
  onSave,
  membro
}) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    telefone: '',
    status: 'ativo'
  });

  useEffect(() => {
    if (membro) {
      setFormData({
        nome: membro.nome || '',
        email: membro.email || '',
        cargo: membro.cargo || '',
        telefone: membro.telefone || '',
        status: membro.ativo ? 'ativo' : 'inativo'
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        cargo: '',
        telefone: '',
        status: 'ativo'
      });
    }
  }, [membro, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica - apenas nome é obrigatório
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o nome do membro.');
      return;
    }
    
    const dataToSave = {
      ...formData,
      id: membro?.id
    };
    
    console.log('Dados sendo enviados:', dataToSave);
    
    const success = await onSave(dataToSave);
    if (success) {
      onClose();
    }
  };

  
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
                  {membro ? 'Editar Membro' : 'Novo Membro'}
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
                  {membro ? 'Salvar' : 'Cadastrar'}
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
          {/* Header com gradiente azul */}
          <div className="p-6">
            <TooltipProvider>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-semibold">
                    {membro ? 'Editar Membro' : 'Novo Membro da Equipe'}
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-200 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        {membro 
                          ? "Atualize as informações do membro da equipe. Apenas o nome é obrigatório."
                          : "Cadastre um novo membro da equipe. Apenas o nome é obrigatório."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 -mr-2 -mt-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </TooltipProvider>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            {/* Campos do formulário com fundo branco */}
            <div className="bg-white mx-6 rounded-xl p-6 flex-1 overflow-y-auto">
              <EquipeMembroFormFields
                formData={formData}
                setFormData={setFormData}
              />
            </div>

            {/* Footer com gradiente azul e botões */}
            <div className="p-6">
              <EquipeMembroFormActions
                onClose={onClose}
                isEdit={!!membro}
              />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipeMembroForm;
