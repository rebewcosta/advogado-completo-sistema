
export type StatusTarefa = 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada';
export type PrioridadeTarefa = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao_detalhada?: string | null;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  data_vencimento?: string | null;
  data_conclusao?: string | null;
  cliente_id?: string | null;
  processo_id?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
