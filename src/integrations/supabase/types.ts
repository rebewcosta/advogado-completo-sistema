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
          email: string
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
          email: string
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
          email?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_storage_limit: {
        Args: { uid: string; novo_tamanho: number }
        Returns: boolean
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
      verificar_status_assinatura: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
