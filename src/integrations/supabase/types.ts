export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          id: string
          title: string
          turma_id: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          title: string
          turma_id?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          turma_id?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          created_at: string
          date: string
          id: string
          professor_id: string | null
          records: Json
          turma_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          professor_id?: string | null
          records?: Json
          turma_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          professor_id?: string | null
          records?: Json
          turma_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      computers: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          note: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          computer_id: string | null
          id: string
          last_started_at: string | null
          remaining_seconds: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          computer_id?: string | null
          id?: string
          last_started_at?: string | null
          remaining_seconds?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          computer_id?: string | null
          id?: string
          last_started_at?: string | null
          remaining_seconds?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_time_transactions: {
        Row: {
          amount_paid: number
          computer_id: string | null
          created_at: string
          id: string
          minutes: number
          note: string | null
          operation: string | null
          payment_method: string | null
          seller_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number
          computer_id?: string | null
          created_at?: string
          id?: string
          minutes?: number
          note?: string | null
          operation?: string | null
          payment_method?: string | null
          seller_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          computer_id?: string | null
          created_at?: string
          id?: string
          minutes?: number
          note?: string | null
          operation?: string | null
          payment_method?: string | null
          seller_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      material_progress: {
        Row: {
          completed_at: string
          id: string
          material_id: string
          student_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          material_id: string
          student_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          material_id?: string
          student_id?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          file_data: string | null
          file_name: string | null
          file_type: string | null
          id: string
          professor_id: string | null
          title: string
          turma_id: string | null
          type: string
          uploaded_at: string
          video_url: string | null
        }
        Insert: {
          file_data?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          professor_id?: string | null
          title: string
          turma_id?: string | null
          type: string
          uploaded_at?: string
          video_url?: string | null
        }
        Update: {
          file_data?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          professor_id?: string | null
          title?: string
          turma_id?: string | null
          type?: string
          uploaded_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          id: string
          month: string
          paid_at: string | null
          status: string
          student_id: string
        }
        Insert: {
          amount?: number
          id?: string
          month: string
          paid_at?: string | null
          status?: string
          student_id: string
        }
        Update: {
          amount?: number
          id?: string
          month?: string
          paid_at?: string | null
          status?: string
          student_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          course_end_date: string | null
          course_start_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          enrollment_date: string | null
          id: string
          name: string
          phone: string | null
          turma_id: string | null
          turma_ids: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          course_end_date?: string | null
          course_start_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          enrollment_date?: string | null
          id: string
          name?: string
          phone?: string | null
          turma_id?: string | null
          turma_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          course_end_date?: string | null
          course_start_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          enrollment_date?: string | null
          id?: string
          name?: string
          phone?: string | null
          turma_id?: string | null
          turma_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          file_data: string | null
          file_name: string
          file_type: string | null
          id: string
          status: string
          student_id: string
          submitted_at: string
          turma_id: string | null
        }
        Insert: {
          file_data?: string | null
          file_name: string
          file_type?: string | null
          id?: string
          status?: string
          student_id: string
          submitted_at?: string
          turma_id?: string | null
        }
        Update: {
          file_data?: string | null
          file_name?: string
          file_type?: string | null
          id?: string
          status?: string
          student_id?: string
          submitted_at?: string
          turma_id?: string | null
        }
        Relationships: []
      }
      turmas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          professor_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          professor_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          professor_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "professor" | "aluno" | "vendedor" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "professor", "aluno", "vendedor", "cliente"],
    },
  },
} as const
