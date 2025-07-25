import { z } from 'zod';

export const clienteSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Email inválido." }),
  telefone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 dígitos." }),
  tipo: z.enum(['Pessoa Física', 'Pessoa Jurídica']),
  cpf: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
});