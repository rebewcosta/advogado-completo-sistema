import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useClientesState } from '@/hooks/clientes/useClientesState';
import ClienteFormHeader from './ClienteFormHeader';
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';

type ClienteFormDialogProps = {
  children: React.ReactNode;
};

const ClienteFormDialog = ({ children }: ClienteFormDialogProps) => {
  const { isModalOpen, handleModalOpenChange } = useClientesState();

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* A chave da correção está aqui:
        - flex flex-col: Organiza o conteúdo em uma coluna (cabeçalho, corpo, rodapé).
        - max-h-[90vh]: Garante que a altura do modal nunca passe de 90% da altura da tela.
        - p-0: Remove o padding padrão para termos controle total.
      */}
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh] p-0">
        <div className="p-6 border-b">
          <ClienteFormHeader />
        </div>
        
        {/* - flex-1: Faz esta área crescer para ocupar o espaço disponível.
          - overflow-y-auto: Adiciona a barra de rolagem vertical apenas quando necessário.
          - p-6: Adiciona o espaçamento interno de volta.
        */}
        <div className="flex-1 overflow-y-auto p-6">
          <ClienteFormFields />
        </div>

        <DialogFooter className="p-6 mt-auto bg-gray-50 border-t">
          <ClienteFormActions />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;