import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ClienteFormFields } from './ClienteFormFields';
import { ClienteFormActions } from './ClienteFormActions';
import { clienteSchema } from '@/hooks/clientes/clienteValidation';
import { z } from 'zod';
import { Cliente } from '@/hooks/clientes/types';

type FormData = z.infer<typeof clienteSchema>;

interface ClienteFormDialogProps {
  cliente: Cliente | null;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

export const ClienteFormDialog: React.FC<ClienteFormDialogProps> = ({
  cliente,
  isModalOpen,
  setIsModalOpen,
  onSubmit,
  isSubmitting,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente || {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      cep: '',
      endereco: '',
      cidade: '',
      estado: '',
      tipo: 'Pessoa Física',
    },
  });

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {cliente ? 'Edite as informações do seu cliente.' : 'Preencha os dados para adicionar um novo cliente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ClienteFormFields control={control} errors={errors} />
          <ClienteFormActions isSubmitting={isSubmitting} onCancel={() => setIsModalOpen(false)} />
        </form>
      </DialogContent>
    </Dialog>
  );
};