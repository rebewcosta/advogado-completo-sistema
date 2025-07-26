import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clienteSchema, ClienteFormValidation } from '@/hooks/clientes/clienteValidation'
import ClienteFormFields from './clientes/ClienteFormFields'
import { Cliente } from '@/hooks/clientes/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ConsultaCep = ({ onAddressFound }: { onAddressFound: (address: any) => void }) => {
  const [cep, setCep] = useState('')
  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => { setCep(event.target.value) }
  const handleSearchCep = async () => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) { onAddressFound(data) } else { alert('CEP não encontrado.') }
      } catch (error) { console.error('Erro ao buscar CEP:', error); alert('Erro ao buscar CEP.') }
    }
  }
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="text" placeholder="CEP" value={cep} onChange={handleCepChange} maxLength={8} />
      <Button type="button" onClick={handleSearchCep}>Buscar</Button>
    </div>
  )
}

const ClienteForm = ({ clienteInicial, onSave }: { clienteInicial: Cliente | null, onSave: (data: Cliente) => void }) => {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<ClienteFormValidation>({
    resolver: zodResolver(clienteSchema),
    defaultValues: clienteInicial || { nome: '', email: '', telefone: '', cpf: '', cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '' },
  })
  const onSubmit = (data: ClienteFormValidation) => { onSave({ ...(clienteInicial || {}), ...data }) }
  const handleAddressFound = (address: any) => {
    setValue('endereco', address.logradouro)
    setValue('bairro', address.bairro)
    setValue('cidade', address.localidade)
    setValue('estado', address.uf)
  }
  return (
    <form id="cliente-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
      <ClienteFormFields control={control} errors={errors} />
      <ConsultaCep onAddressFound={handleAddressFound} />
    </form>
  )
}
export default ClienteForm