import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  clienteSchema,
  ClienteFormValidation,
} from '@/hooks/clientes/clienteValidation'
import ClienteFormFields from './clientes/ClienteFormFields'
import { ConsultaCep } from './correios/ConsultaCep' // Correção aqui
import { Cliente } from '@/hooks/clientes/types'

interface ClienteFormProps {
  clienteInicial: Cliente | null
  onSave: (data: Cliente) => void
}

const ClienteForm = ({ clienteInicial, onSave }: ClienteFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClienteFormValidation>({
    resolver: zodResolver(clienteSchema),
    defaultValues: clienteInicial || {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      cep: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  })

  const onSubmit = (data: ClienteFormValidation) => {
    onSave({ ...(clienteInicial || {}), ...data })
  }

  const handleAddressFound = (address: any) => {
    setValue('endereco', address.logradouro)
    setValue('bairro', address.bairro)
    setValue('cidade', address.localidade)
    setValue('estado', address.uf)
  }

  return (
    <form
      id="cliente-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 py-1"
    >
      <ClienteFormFields control={control} errors={errors} />
      <ConsultaCep onAddressFound={handleAddressFound} />
    </form>
  )
}

export default ClienteForm