import { supabase } from '@/integrations/supabase'
import { prepareClientDataForSave } from './clienteValidation'
import { Cliente } from './types'

export const fetchClientes = async (searchTerm: string = '') => {
  let query = supabase.from('clientes').select('*')

  if (searchTerm) {
    query = query.or(
      `nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`,
    )
  }

  const { data, error } = await query.order('id', { ascending: false })

  if (error) {
    console.error('Erro ao buscar clientes:', error)
    throw error
  }
  return data
}

export const saveCliente = async (cliente: Cliente) => {
  const preparedCliente = prepareClientDataForSave(cliente)

  if (cliente.id) {
    // Atualizar cliente existente
    const { data, error } = await supabase
      .from('clientes')
      .update(preparedCliente)
      .eq('id', cliente.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    // Inserir novo cliente
    const { data, error } = await supabase
      .from('clientes')
      .insert(preparedCliente)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export const deleteCliente = async (id: number) => {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}