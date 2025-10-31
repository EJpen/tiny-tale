import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions for TypeScript
export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  pin: string;
  is_public: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  room_id: string;
  vote: "boy" | "girl";
  created_at: string;
}
