
import React, { useState, useEffect } from 'react';
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
        status: membro.status || 'ativo'
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
    
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl">
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
