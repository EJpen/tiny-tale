import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables for server operations"
  );
}

// Server-side client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client-side public client (respects RLS)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions for TypeScript
export interface User {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  trusteeId: string;
  roomName: string;
  gender: string;
  ownerPin: string;
  memberPin: string;
  isClose: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  roomId: string;
  name: string;
  gender: string;
  isOut: boolean;
  createdAt: string;
  updatedAt: string;
}
