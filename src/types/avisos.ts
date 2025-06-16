
export interface AvisoAdministrativo {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  prioridade: 'baixa' | 'normal' | 'alta' | 'critica';
  ativo: boolean;
  data_inicio: string;
  data_fim: string | null;
  criado_por: string;
  created_at: string;
  updated_at: string;
}

export interface AvisoLido {
  id: string;
  aviso_id: string;
  user_id: string;
  lido_em: string;
}

export interface AvisoNaoLido {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  prioridade: 'baixa' | 'normal' | 'alta' | 'critica';
  data_inicio: string;
  data_fim: string | null;
}
