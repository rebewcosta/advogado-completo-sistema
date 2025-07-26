import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ClienteForm from '@/components/ClienteForm'
import { Cliente } from '@/hooks/clientes/types'
import { Button } from '@/components/ui/button'

interface ClienteFormDialogProps {
  isOpen: boolean
  onClose: () => void
  cliente: Cliente | null
  onSave: (cliente: Cliente) => void
}

const ClienteFormDialog = ({
  isOpen,
  onClose,
  cliente,
  onSave,
}: ClienteFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {cliente
              ? 'Atualize os dados do cliente.'
              : 'Preencha os dados do novo cliente.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4">
          <ClienteForm clienteInicial={cliente} onSave={onSave} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="cliente-form">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ClienteFormDialog