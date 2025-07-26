import { z } from 'zod'

export const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})

export type ClienteFormValidation = z.infer<typeof clienteSchema>

export const prepareClientDataForSave = (cliente: Partial<ClienteFormValidation>) => {
  const preparedData: { [key: string]: any } = { ...cliente }
  Object.keys(preparedData).forEach(key => {
    if (preparedData[key] === '') {
      preparedData[key] = null
    }
  })
  return preparedData
}