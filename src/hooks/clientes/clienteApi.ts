
import { supabase } from '@/integrations/supabase/client';
import type { Cliente, ClienteFormData } from './types';
import { prepareClientDataForSave } from './clienteValidation';

export const fetchClientsList = async (userId: string): Promise<Cliente[]> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', userId)
    .order('nome', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createClient = async (clientData: ClienteFormData, userId: string): Promise<void> => {
  const dataToSave = prepareClientDataForSave(clientData);
  
  const { error } = await supabase
    .from('clientes')
    .insert({
      ...dataToSave,
      user_id: userId
    });
  
  if (error) {
    console.error('Erro ao inserir cliente:', error);
    throw error;
  }
};

export const updateClient = async (clientData: ClienteFormData, clientId: string): Promise<void> => {
  const dataToSave = prepareClientDataForSave(clientData);
  
  const { error } = await supabase
    .from('clientes')
    .update({
      ...dataToSave,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId);
  
  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

export const toggleClientStatus = async (clientId: string, newStatus: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes')
    .update({ status_cliente: newStatus })
    .eq('id', clientId);
  
  if (error) throw error;
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', clientId);
  
  if (error) throw error;
};
