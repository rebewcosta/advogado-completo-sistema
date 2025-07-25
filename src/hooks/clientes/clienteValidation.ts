import { z } from 'zod'

// Exportando 'clienteSchema' para que outros arquivos possam usá-lo
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

// Exportando o 'tipo' para ser usado em outras partes do código
export type ClienteFormValidation = z.infer<typeof clienteSchema>