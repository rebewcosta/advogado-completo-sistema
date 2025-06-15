export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agenda_eventos: {
        Row: {
          cliente_associado_id: string | null
          created_at: string
          data_hora_inicio: string
          descricao_evento: string | null
          duracao_minutos: number
          id: string
          lembrete_proxima_hora_enviado_em: string | null
          local_evento: string | null
          prioridade: string
          processo_associado_id: string | null
          status_evento: string | null
          tipo_evento: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_associado_id?: string | null
          created_at?: string
          data_hora_inicio: string
          descricao_evento?: string | null
          duracao_minutos?: number
          id?: string
          lembrete_proxima_hora_enviado_em?: string | null
          local_evento?: string | null
          prioridade?: string
          processo_associado_id?: string | null
          status_evento?: string | null
          tipo_evento?: string | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_associado_id?: string | null
          created_at?: string
          data_hora_inicio?: string
          descricao_evento?: string | null
          duracao_minutos?: number
          id?: string
          lembrete_proxima_hora_enviado_em?: string | null
          local_evento?: string | null
          prioridade?: string
          processo_associado_id?: string | null
          status_evento?: string | null
          tipo_evento?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_eventos_cliente_associado_id_fkey"
            columns: ["cliente_associado_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_processo_associado_id_fkey"
            columns: ["processo_associado_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          cpfCnpj: string
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          status_cliente: string
          telefone: string
          tipo_cliente: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpfCnpj: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status_cliente?: string
          telefone: string
          tipo_cliente?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpfCnpj?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status_cliente?: string
          telefone?: string
          tipo_cliente?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      configuracoes_monitoramento: {
        Row: {
          created_at: string
          estados_monitoramento: string[] | null
          id: string
          monitoramento_ativo: boolean | null
          nomes_escritorio: string[] | null
          nomes_monitoramento: string[]
          numeros_oab: string[] | null
          palavras_chave: string[] | null
          ultima_busca: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estados_monitoramento?: string[] | null
          id?: string
          monitoramento_ativo?: boolean | null
          nomes_escritorio?: string[] | null
          nomes_monitoramento?: string[]
          numeros_oab?: string[] | null
          palavras_chave?: string[] | null
          ultima_busca?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estados_monitoramento?: string[] | null
          id?: string
          monitoramento_ativo?: boolean | null
          nomes_escritorio?: string[] | null
          nomes_monitoramento?: string[]
          numeros_oab?: string[] | null
          palavras_chave?: string[] | null
          ultima_busca?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          cliente: string
          content_type: string
          created_at: string
          id: string
          nome: string
          path: string
          processo: string | null
          tamanho_bytes: number
          tipo: string
          user_id: string
        }
        Insert: {
          cliente: string
          content_type: string
          created_at?: string
          id?: string
          nome: string
          path: string
          processo?: string | null
          tamanho_bytes: number
          tipo: string
          user_id: string
        }
        Update: {
          cliente?: string
          content_type?: string
          created_at?: string
          id?: string
          nome?: string
          path?: string
          processo?: string | null
          tamanho_bytes?: number
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      equipe_membros: {
        Row: {
          ativo: boolean
          cargo: string | null
          created_at: string
          data_ingresso: string | null
          email: string | null
          id: string
          nivel_permissao: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          data_ingresso?: string | null
          email?: string | null
          id?: string
          nivel_permissao?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          data_ingresso?: string | null
          email?: string | null
          id?: string
          nivel_permissao?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equipe_produtividade: {
        Row: {
          clientes_atendidos: number | null
          created_at: string
          data_registro: string
          horas_trabalhadas: number | null
          id: string
          membro_id: string | null
          observacoes: string | null
          processos_atualizados: number | null
          tarefas_concluidas: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clientes_atendidos?: number | null
          created_at?: string
          data_registro?: string
          horas_trabalhadas?: number | null
          id?: string
          membro_id?: string | null
          observacoes?: string | null
          processos_atualizados?: number | null
          tarefas_concluidas?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clientes_atendidos?: number | null
          created_at?: string
          data_registro?: string
          horas_trabalhadas?: number | null
          id?: string
          membro_id?: string | null
          observacoes?: string | null
          processos_atualizados?: number | null
          tarefas_concluidas?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipe_produtividade_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "equipe_membros"
            referencedColumns: ["id"]
          },
        ]
      }
      equipe_tarefas: {
        Row: {
          cliente_associado_id: string | null
          created_at: string
          data_conclusao: string | null
          data_vencimento: string | null
          delegado_por_id: string | null
          descricao_detalhada: string | null
          id: string
          observacoes_conclusao: string | null
          prioridade: string
          processo_associado_id: string | null
          responsavel_id: string | null
          status: string
          tempo_estimado_horas: number | null
          tempo_gasto_horas: number | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_associado_id?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_vencimento?: string | null
          delegado_por_id?: string | null
          descricao_detalhada?: string | null
          id?: string
          observacoes_conclusao?: string | null
          prioridade?: string
          processo_associado_id?: string | null
          responsavel_id?: string | null
          status?: string
          tempo_estimado_horas?: number | null
          tempo_gasto_horas?: number | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_associado_id?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_vencimento?: string | null
          delegado_por_id?: string | null
          descricao_detalhada?: string | null
          id?: string
          observacoes_conclusao?: string | null
          prioridade?: string
          processo_associado_id?: string | null
          responsavel_id?: string | null
          status?: string
          tempo_estimado_horas?: number | null
          tempo_gasto_horas?: number | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipe_tarefas_delegado_por_id_fkey"
            columns: ["delegado_por_id"]
            isOneToOne: false
            referencedRelation: "equipe_membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipe_tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "equipe_membros"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes_diarios: {
        Row: {
          ativo: boolean | null
          created_at: string
          estado: string
          id: string
          nome: string
          seletor_css: string | null
          tipo_fonte: string
          ultima_verificacao: string | null
          url_base: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          estado: string
          id?: string
          nome: string
          seletor_css?: string | null
          tipo_fonte?: string
          ultima_verificacao?: string | null
          url_base: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          estado?: string
          id?: string
          nome?: string
          seletor_css?: string | null
          tipo_fonte?: string
          ultima_verificacao?: string | null
          url_base?: string
        }
        Relationships: []
      }
      historico_consultas: {
        Row: {
          consultado_em: string
          id: string
          resultados_encontrados: number | null
          termo_busca: string
          tipo_consulta: string
          tribunal: string | null
          user_id: string
        }
        Insert: {
          consultado_em?: string
          id?: string
          resultados_encontrados?: number | null
          termo_busca: string
          tipo_consulta: string
          tribunal?: string | null
          user_id: string
        }
        Update: {
          consultado_em?: string
          id?: string
          resultados_encontrados?: number | null
          termo_busca?: string
          tipo_consulta?: string
          tribunal?: string | null
          user_id?: string
        }
        Relationships: []
      }
      logs_monitoramento: {
        Row: {
          created_at: string
          data_execucao: string
          erros: string | null
          fontes_consultadas: string[] | null
          id: string
          publicacoes_encontradas: number | null
          status: string
          tempo_execucao_segundos: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_execucao?: string
          erros?: string | null
          fontes_consultadas?: string[] | null
          id?: string
          publicacoes_encontradas?: number | null
          status?: string
          tempo_execucao_segundos?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_execucao?: string
          erros?: string | null
          fontes_consultadas?: string[] | null
          id?: string
          publicacoes_encontradas?: number | null
          status?: string
          tempo_execucao_segundos?: number | null
          user_id?: string
        }
        Relationships: []
      }
      prazo_alertas: {
        Row: {
          alerta_enviado: boolean
          created_at: string
          data_envio: string | null
          data_prazo: string
          descricao: string | null
          dias_restantes: number
          evento_agenda_id: string | null
          id: string
          processo_id: string | null
          tipo_alerta: string
          tipo_prazo: string
          titulo: string
          user_id: string
        }
        Insert: {
          alerta_enviado?: boolean
          created_at?: string
          data_envio?: string | null
          data_prazo: string
          descricao?: string | null
          dias_restantes: number
          evento_agenda_id?: string | null
          id?: string
          processo_id?: string | null
          tipo_alerta: string
          tipo_prazo: string
          titulo: string
          user_id: string
        }
        Update: {
          alerta_enviado?: boolean
          created_at?: string
          data_envio?: string | null
          data_prazo?: string
          descricao?: string | null
          dias_restantes?: number
          evento_agenda_id?: string | null
          id?: string
          processo_id?: string | null
          tipo_alerta?: string
          tipo_prazo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prazo_alertas_evento_agenda_id_fkey"
            columns: ["evento_agenda_id"]
            isOneToOne: false
            referencedRelation: "agenda_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prazo_alertas_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      prazo_calculos: {
        Row: {
          ativo: boolean
          considera_feriados: boolean
          considera_fins_semana: boolean
          created_at: string
          dias_prazo: number
          id: string
          nome_calculo: string
          observacoes: string | null
          tipo_prazo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          considera_feriados?: boolean
          considera_fins_semana?: boolean
          created_at?: string
          dias_prazo: number
          id?: string
          nome_calculo: string
          observacoes?: string | null
          tipo_prazo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          considera_feriados?: boolean
          considera_fins_semana?: boolean
          created_at?: string
          dias_prazo?: number
          id?: string
          nome_calculo?: string
          observacoes?: string | null
          tipo_prazo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prazo_configuracoes: {
        Row: {
          created_at: string
          dias_alerta_critico: number
          dias_alerta_medio: number
          dias_alerta_urgente: number
          id: string
          notificacoes_email: boolean
          notificacoes_sistema: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dias_alerta_critico?: number
          dias_alerta_medio?: number
          dias_alerta_urgente?: number
          id?: string
          notificacoes_email?: boolean
          notificacoes_sistema?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dias_alerta_critico?: number
          dias_alerta_medio?: number
          dias_alerta_urgente?: number
          id?: string
          notificacoes_email?: boolean
          notificacoes_sistema?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      processos: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: string
          lembrete_prazo_amanha_enviado_em: string | null
          nome_cliente_text: string | null
          numero_processo: string
          proximo_prazo: string | null
          status_processo: string
          tipo_processo: string
          updated_at: string
          user_id: string
          vara_tribunal: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          lembrete_prazo_amanha_enviado_em?: string | null
          nome_cliente_text?: string | null
          numero_processo: string
          proximo_prazo?: string | null
          status_processo?: string
          tipo_processo: string
          updated_at?: string
          user_id?: string
          vara_tribunal?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          lembrete_prazo_amanha_enviado_em?: string | null
          nome_cliente_text?: string | null
          numero_processo?: string
          proximo_prazo?: string | null
          status_processo?: string
          tipo_processo?: string
          updated_at?: string
          user_id?: string
          vara_tribunal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_cache: {
        Row: {
          dados_processo: Json
          data_consulta: string
          data_expiracao: string
          id: string
          numero_processo: string
          tribunal: string | null
        }
        Insert: {
          dados_processo: Json
          data_consulta?: string
          data_expiracao?: string
          id?: string
          numero_processo: string
          tribunal?: string | null
        }
        Update: {
          dados_processo?: Json
          data_consulta?: string
          data_expiracao?: string
          id?: string
          numero_processo?: string
          tribunal?: string | null
        }
        Relationships: []
      }
      processos_favoritos: {
        Row: {
          data_ultima_movimentacao: string | null
          favorito_em: string
          id: string
          nome_processo: string | null
          numero_processo: string
          status_processo: string | null
          tribunal: string | null
          user_id: string
        }
        Insert: {
          data_ultima_movimentacao?: string | null
          favorito_em?: string
          id?: string
          nome_processo?: string | null
          numero_processo: string
          status_processo?: string | null
          tribunal?: string | null
          user_id: string
        }
        Update: {
          data_ultima_movimentacao?: string | null
          favorito_em?: string
          id?: string
          nome_processo?: string | null
          numero_processo?: string
          status_processo?: string | null
          tribunal?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          subscription_data: Json | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          subscription_data?: Json | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          subscription_data?: Json | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      publicacoes_diario_oficial: {
        Row: {
          comarca: string | null
          conteudo_publicacao: string
          created_at: string
          data_publicacao: string
          diario_oficial: string
          estado: string
          id: string
          importante: boolean | null
          lida: boolean | null
          nome_advogado: string
          numero_processo: string | null
          observacoes: string | null
          segredo_justica: boolean | null
          tipo_publicacao: string | null
          titulo_publicacao: string
          updated_at: string
          url_publicacao: string | null
          user_id: string
        }
        Insert: {
          comarca?: string | null
          conteudo_publicacao: string
          created_at?: string
          data_publicacao: string
          diario_oficial: string
          estado: string
          id?: string
          importante?: boolean | null
          lida?: boolean | null
          nome_advogado: string
          numero_processo?: string | null
          observacoes?: string | null
          segredo_justica?: boolean | null
          tipo_publicacao?: string | null
          titulo_publicacao: string
          updated_at?: string
          url_publicacao?: string | null
          user_id: string
        }
        Update: {
          comarca?: string | null
          conteudo_publicacao?: string
          created_at?: string
          data_publicacao?: string
          diario_oficial?: string
          estado?: string
          id?: string
          importante?: boolean | null
          lida?: boolean | null
          nome_advogado?: string
          numero_processo?: string | null
          observacoes?: string | null
          segredo_justica?: boolean | null
          tipo_publicacao?: string | null
          titulo_publicacao?: string
          updated_at?: string
          url_publicacao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_conclusao: string | null
          data_vencimento: string | null
          descricao_detalhada: string | null
          id: string
          prioridade: string
          processo_id: string | null
          status: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_vencimento?: string | null
          descricao_detalhada?: string | null
          id?: string
          prioridade?: string
          processo_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_vencimento?: string | null
          descricao_detalhada?: string | null
          id?: string
          prioridade?: string
          processo_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_financeiras: {
        Row: {
          categoria: string
          cliente_associado_id: string | null
          created_at: string
          data_transacao: string
          descricao: string
          id: string
          processo_associado_id: string | null
          status_pagamento: string | null
          tipo_transacao: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          cliente_associado_id?: string | null
          created_at?: string
          data_transacao?: string
          descricao: string
          id?: string
          processo_associado_id?: string | null
          status_pagamento?: string | null
          tipo_transacao?: string
          updated_at?: string
          user_id?: string
          valor: number
        }
        Update: {
          categoria?: string
          cliente_associado_id?: string | null
          created_at?: string
          data_transacao?: string
          descricao?: string
          id?: string
          processo_associado_id?: string | null
          status_pagamento?: string | null
          tipo_transacao?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_financeiras_cliente_associado_id_fkey"
            columns: ["cliente_associado_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_processo_associado_id_fkey"
            columns: ["processo_associado_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_storage_limit: {
        Args: { uid: string; novo_tamanho: number }
        Returns: boolean
      }
      executar_monitoramento_automatico: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gerar_alertas_prazos: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_prazos_criticos: {
        Args: { p_user_id: string; p_dias_limite?: number }
        Returns: {
          id: string
          tipo: string
          titulo: string
          data_prazo: string
          dias_restantes: number
          nivel_criticidade: string
          detalhes: Json
        }[]
      }
      get_user_by_email: {
        Args: { email_to_check: string }
        Returns: {
          count: number
        }[]
      }
      get_user_storage_usage: {
        Args: { uid: string }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      verificar_status_assinatura: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
