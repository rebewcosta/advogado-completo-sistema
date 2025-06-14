
import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransacaoFormFields from './TransacaoFormFields';
import type { Database } from '@/integrations/supabase/types';

type TransacaoSupabase = Database['public']['Tables']['transacoes_financeiras']['Row'];

interface TransacaoFormData {
  tipo: string;
  descricao: string;
  valor: string;
  categoria: string;
  data: string;
  status: string;
}

interface TransacaoModalProps {
  isOpen: boolean;
  currentTransaction: TransacaoSupabase | null;
  formData: TransacaoFormData;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const TransacaoModal: React.FC<TransacaoModalProps> = ({
  isOpen,
  currentTransaction,
  formData,
  isLoading,
  onClose,
  onSubmit,
  handleChange,
  handleSelectChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {currentTransaction ? 'Editar Transação' : 'Nova Transação'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-gray-500 hover:text-gray-700 -mr-1 -mt-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex-grow overflow-y-auto">
          <CardContent className="p-4">
            <TransacaoFormFields
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
            />
          </CardContent>
          <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-gray-50 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-gray-700 hover:bg-gray-100 border-gray-300"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {currentTransaction ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TransacaoModal;
