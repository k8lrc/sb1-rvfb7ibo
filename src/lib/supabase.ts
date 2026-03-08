import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WeatherAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  issued_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface TornadoIndex {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  baron_index: number;
  wind_shear: number;
  cape_value: number;
  helicity: number;
  risk_level: string;
  measured_at: string;
  created_at: string;
}
