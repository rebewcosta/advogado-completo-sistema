
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
      <Card className="bg-blue-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-blue-700">
        <CardHeader className="p-4 border-b border-blue-700 sticky top-0 bg-blue-900 z-10 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-100">
              {currentTransaction ? 'Editar Transação' : 'Nova Transação'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-gray-300 hover:text-gray-100 hover:bg-blue-800 -mr-1 -mt-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex-grow overflow-y-auto">
          <CardContent className="p-4 bg-blue-900">
            <TransacaoFormFields
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
            />
          </CardContent>
          <div className="p-4 border-t border-blue-700 flex justify-end gap-2 sticky bottom-0 bg-blue-900 z-10 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-gray-100 hover:bg-blue-800 border-blue-600 bg-transparent"
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
