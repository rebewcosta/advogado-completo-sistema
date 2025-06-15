
export interface AlertaPrazo {
  id: string;
  tipo_prazo: string;
  tipo_alerta: string;
  data_prazo: string;
  dias_restantes: number;
  titulo: string;
  descricao: string;
  alerta_enviado: boolean;
  data_envio: string;
  created_at: string;
}

export interface AlertFilters {
  status: string;
  tipo: string;
  termoBusca: string;
}
