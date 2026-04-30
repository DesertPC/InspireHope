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
      case_activities: {
        Row: {
          activity_date: string
          activity_type: string
          case_id: string
          created_at: string
          description: string
          hours_spent: number
          id: string
          miles_driven: number | null
          updated_at: string
          volunteer_id: string | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          case_id: string
          created_at?: string
          description: string
          hours_spent: number
          id?: string
          miles_driven?: number | null
          updated_at?: string
          volunteer_id?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          case_id?: string
          created_at?: string
          description?: string
          hours_spent?: number
          id?: string
          miles_driven?: number | null
          updated_at?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_activities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_dashboard"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "case_activities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activities_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          case_id: string
          contact_name: string | null
          contact_phone: string | null
          content: string
          created_at: string
          created_by: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          note_type: string
          updated_at: string
        }
        Insert: {
          case_id: string
          contact_name?: string | null
          contact_phone?: string | null
          content: string
          created_at?: string
          created_by: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          note_type?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          contact_name?: string | null
          contact_phone?: string | null
          content?: string
          created_at?: string
          created_by?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          note_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_dashboard"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          case_number: string
          completion_date: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          outcome_notes: string | null
          priority: string
          resources_money_allocated: number | null
          senior_id: string
          service_type: string
          start_date: string | null
          status: string
          target_date: string | null
          updated_at: string
          volunteer_hours_allocated: number | null
          volunteer_hours_used: number | null
        }
        Insert: {
          assigned_to?: string | null
          case_number?: string
          completion_date?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          outcome_notes?: string | null
          priority?: string
          resources_money_allocated?: number | null
          senior_id: string
          service_type: string
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          volunteer_hours_allocated?: number | null
          volunteer_hours_used?: number | null
        }
        Update: {
          assigned_to?: string | null
          case_number?: string
          completion_date?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          outcome_notes?: string | null
          priority?: string
          resources_money_allocated?: number | null
          senior_id?: string
          service_type?: string
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          volunteer_hours_allocated?: number | null
          volunteer_hours_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          created_at: string
          description: string | null
          document_category: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_confidential: boolean
          senior_id: string | null
          signed_url: string | null
          signed_url_expires: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          document_category: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_confidential?: boolean
          senior_id?: string | null
          signed_url?: string | null
          signed_url_expires?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          document_category?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_confidential?: boolean
          senior_id?: string | null
          signed_url?: string | null
          signed_url_expires?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_dashboard"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "seniors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donation_type: string
          donor_email: string
          donor_name: string
          donor_phone: string | null
          fee_amount: number | null
          fee_covered_by_donor: boolean | null
          id: string
          is_anonymous: boolean
          is_recurring: boolean
          message: string | null
          net_amount: number | null
          payment_status: string
          processed_by: string | null
          recurring_interval: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          tax_receipt_number: string | null
          tax_receipt_sent: boolean
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donation_type?: string
          donor_email: string
          donor_name: string
          donor_phone?: string | null
          fee_amount?: number | null
          fee_covered_by_donor?: boolean | null
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          message?: string | null
          net_amount?: number | null
          payment_status?: string
          processed_by?: string | null
          recurring_interval?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          tax_receipt_number?: string | null
          tax_receipt_sent?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donation_type?: string
          donor_email?: string
          donor_name?: string
          donor_phone?: string | null
          fee_amount?: number | null
          fee_covered_by_donor?: boolean | null
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          message?: string | null
          net_amount?: number | null
          payment_status?: string
          processed_by?: string | null
          recurring_interval?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          tax_receipt_number?: string | null
          tax_receipt_sent?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          case_id: string | null
          category: string
          created_at: string
          currency: string
          description: string
          expense_date: string
          id: string
          is_reimbursable: boolean | null
          notes: string | null
          payment_method: string | null
          receipt_number: string | null
          receipt_url: string | null
          reimbursement_status: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          case_id?: string | null
          category: string
          created_at?: string
          currency?: string
          description: string
          expense_date?: string
          id?: string
          is_reimbursable?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          reimbursement_status?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          case_id?: string | null
          category?: string
          created_at?: string
          currency?: string
          description?: string
          expense_date?: string
          id?: string
          is_reimbursable?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          reimbursement_status?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_dashboard"
            referencedColumns: ["case_id"]
          },
          {
            foreignKeyName: "expenses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      seniors: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          housing_status: string | null
          id: string
          iehp_id: string | null
          iehp_member: boolean | null
          income_level: string | null
          is_active: boolean
          languages: string[] | null
          last_name: string
          notes: string | null
          phone: string | null
          primary_needs: string[] | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          housing_status?: string | null
          id?: string
          iehp_id?: string | null
          iehp_member?: boolean | null
          income_level?: string | null
          is_active?: boolean
          languages?: string[] | null
          last_name: string
          notes?: string | null
          phone?: string | null
          primary_needs?: string[] | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          housing_status?: string | null
          id?: string
          iehp_id?: string | null
          iehp_member?: boolean | null
          income_level?: string | null
          is_active?: boolean
          languages?: string[] | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          primary_needs?: string[] | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seniors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      case_dashboard: {
        Row: {
          activity_count: number | null
          assigned_to_name: string | null
          case_id: string | null
          case_number: string | null
          completion_date: string | null
          note_count: number | null
          priority: string | null
          resources_money_allocated: number | null
          senior_name: string | null
          service_type: string | null
          start_date: string | null
          status: string | null
          target_date: string | null
          total_expenses: number | null
          volunteer_hours_allocated: number | null
          volunteer_hours_used: number | null
        }
        Relationships: []
      }
      financial_summary: {
        Row: {
          donation_count: number | null
          expense_count: number | null
          month: string | null
          net_balance: number | null
          net_donations: number | null
          total_donations: number | null
          total_expenses: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
