import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ProcessForm from '@/components/ProcessForm'
import { z } from 'zod'
import { Processo } from '@/integrations/supabase/types'

export const processoSchema = z.object({
  numero_processo: z.string().min(1, 'O número do processo é obrigatório.'),
  classe_judicial: z.string().optional(),
  assunto: z.string().optional(),
  jurisdicao: z.string().optional(),
  orgao_julgador: z.string().optional(),
  juiz_relator: z.string().optional(),
  data_distribuicao: z.string().optional(),
  valor_causa: z.string().optional(),
  status: z.string().min(1, 'O status é obrigatório.'),
  cliente_id: z.string().uuid({ message: 'Por favor, selecione um cliente.' }),
  movimentacoes: z.string().optional(),
  documentos: z.string().optional(),
  informacoes_adicionais: z.string().optional(),
})

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação não pode ser desfeita. Isso excluirá permanentemente o
          processo.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

interface ProcessFormDialogProps {
  isOpen: boolean
  onClose: () => void
  processo: Processo | null
  onSave: (data: any) => void
}

export const ProcessFormDialog = ({
  isOpen,
  onClose,
  processo,
  onSave,
}: ProcessFormDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {processo ? 'Editar Processo' : 'Novo Processo'}
        </DialogTitle>
        <DialogDescription>
          {processo
            ? 'Edite as informações do processo abaixo.'
            : 'Preencha as informações do novo processo.'}
        </DialogDescription>
      </DialogHeader>
      <ProcessForm processo={processo} onSave={onSave} onCancel={onClose} />
    </DialogContent>
  </Dialog>
)