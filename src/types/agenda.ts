
import type { Database } from '@/integrations/supabase/types';

export type AgendaEvent = Database['public']['Tables']['agenda_eventos']['Row'] & {
  clientes?: { id: string; nome: string } | null;
  processos?: { id: string; numero_processo: string } | null;
};

export type EventoAgenda = AgendaEvent;
