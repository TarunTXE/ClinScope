export interface Profile {
  id: string;
  full_name: string;
  email: string;
  specialization?: string | null;
  institution?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ResearchStudy {
  id: string;
  doctor_id: string;
  title: string;
  research_objective: string;
  created_at: string;
  updated_at?: string;
  records_count?: number;
  status?: string;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "boolean";

export interface FormField {
  id?: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface FormSection {
  id?: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSchema {
  title: string;
  description?: string;
  sections: FormSection[];
}

export interface ResearchForm {
  id: string;
  study_id: string;
  title: string;
  schema: FormSchema;
  status: "draft" | "published";
  created_at: string;
  updated_at?: string;
}

export interface ResearchRecord {
  id: string;
  study_id: string;
  research_id: string;
  responses: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          specialization: string | null;
          institution: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          specialization?: string | null;
          institution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          specialization?: string | null;
          institution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      research_studies: {
        Row: {
          id: string;
          doctor_id: string;
          title: string;
          research_objective: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          title: string;
          research_objective: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          title?: string;
          research_objective?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_studies_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      research_forms: {
        Row: {
          id: string;
          study_id: string;
          title: string;
          schema: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          study_id: string;
          title: string;
          schema: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          study_id?: string;
          title?: string;
          schema?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_forms_study_id_fkey";
            columns: ["study_id"];
            isOneToOne: false;
            referencedRelation: "research_studies";
            referencedColumns: ["id"];
          }
        ];
      };
      research_records: {
        Row: {
          id: string;
          study_id: string;
          research_id: string;
          responses: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          study_id: string;
          research_id: string;
          responses: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          study_id?: string;
          research_id?: string;
          responses?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_records_study_id_fkey";
            columns: ["study_id"];
            isOneToOne: false;
            referencedRelation: "research_studies";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
