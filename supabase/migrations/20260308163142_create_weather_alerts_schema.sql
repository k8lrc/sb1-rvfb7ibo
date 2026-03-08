/*
  # Weather Alert System with Baron Tornado Index

  ## Overview
  Creates a comprehensive weather alert system with Baron Tornado Index tracking capabilities.
  
  ## New Tables
  
  ### `weather_alerts`
  - `id` (uuid, primary key) - Unique alert identifier
  - `alert_type` (text) - Type of weather alert (tornado, severe_thunderstorm, flash_flood, etc.)
  - `severity` (text) - Alert severity level (extreme, severe, moderate, minor)
  - `title` (text) - Alert title/headline
  - `description` (text) - Detailed alert description
  - `location` (text) - Affected location/area
  - `latitude` (numeric) - Latitude coordinate
  - `longitude` (numeric) - Longitude coordinate
  - `issued_at` (timestamptz) - When alert was issued
  - `expires_at` (timestamptz) - When alert expires
  - `is_active` (boolean) - Whether alert is currently active
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `tornado_index`
  - `id` (uuid, primary key) - Unique index record identifier
  - `location` (text) - Location name
  - `latitude` (numeric) - Latitude coordinate
  - `longitude` (numeric) - Longitude coordinate
  - `baron_index` (numeric) - Baron Tornado Index value (0-10 scale)
  - `wind_shear` (numeric) - Wind shear measurement
  - `cape_value` (numeric) - CAPE (Convective Available Potential Energy) value
  - `helicity` (numeric) - Storm relative helicity
  - `risk_level` (text) - Risk assessment (low, moderate, high, extreme)
  - `measured_at` (timestamptz) - Measurement timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `user_locations`
  - `id` (uuid, primary key) - Unique location identifier
  - `user_id` (uuid) - Reference to auth.users
  - `location_name` (text) - Custom location name
  - `latitude` (numeric) - Latitude coordinate
  - `longitude` (numeric) - Longitude coordinate
  - `is_primary` (boolean) - Whether this is user's primary location
  - `created_at` (timestamptz) - Record creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Public read access for weather_alerts and tornado_index (public safety data)
  - Authenticated users can manage their own locations
  - Only authenticated users can create/update alert data (for admin/API purposes)
  
  ## Important Notes
  1. Baron Tornado Index is a proprietary algorithm that combines multiple atmospheric parameters
  2. Index values range from 0 (no tornado threat) to 10 (extreme tornado threat)
  3. Weather alerts follow NOAA/NWS alert standards
  4. All timestamps use UTC timezone
*/

-- Create weather_alerts table
CREATE TABLE IF NOT EXISTS weather_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'moderate',
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create tornado_index table
CREATE TABLE IF NOT EXISTS tornado_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  latitude numeric(10, 6) NOT NULL,
  longitude numeric(10, 6) NOT NULL,
  baron_index numeric(4, 2) NOT NULL,
  wind_shear numeric(6, 2),
  cape_value numeric(8, 2),
  helicity numeric(6, 2),
  risk_level text NOT NULL DEFAULT 'low',
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create user_locations table
CREATE TABLE IF NOT EXISTS user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  latitude numeric(10, 6) NOT NULL,
  longitude numeric(10, 6) NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tornado_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weather_alerts
CREATE POLICY "Anyone can view active weather alerts"
  ON weather_alerts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert weather alerts"
  ON weather_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update weather alerts"
  ON weather_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for tornado_index
CREATE POLICY "Anyone can view tornado index data"
  ON tornado_index FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert tornado index data"
  ON tornado_index FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tornado index data"
  ON tornado_index FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_locations
CREATE POLICY "Users can view own locations"
  ON user_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own locations"
  ON user_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations"
  ON user_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations"
  ON user_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_weather_alerts_active ON weather_alerts(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_location ON weather_alerts(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_tornado_index_location ON tornado_index(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_tornado_index_measured_at ON tornado_index(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);

-- Insert sample data for demonstration
INSERT INTO weather_alerts (alert_type, severity, title, description, location, latitude, longitude, issued_at, expires_at, is_active)
VALUES 
  ('tornado', 'extreme', 'Tornado Warning', 'Tornado warning in effect. Take shelter immediately. A confirmed tornado was spotted near downtown area moving northeast at 35 mph.', 'Oklahoma City, OK', 35.4676, -97.5164, now(), now() + interval '2 hours', true),
  ('severe_thunderstorm', 'severe', 'Severe Thunderstorm Warning', 'Severe thunderstorm capable of producing damaging winds up to 70 mph and quarter size hail.', 'Tulsa, OK', 36.1540, -95.9928, now(), now() + interval '1 hour', true),
  ('flash_flood', 'moderate', 'Flash Flood Watch', 'Flash flooding possible due to heavy rainfall. Be prepared to move to higher ground.', 'Norman, OK', 35.2226, -97.4395, now(), now() + interval '6 hours', true);

INSERT INTO tornado_index (location, latitude, longitude, baron_index, wind_shear, cape_value, helicity, risk_level, measured_at)
VALUES 
  ('Oklahoma City, OK', 35.4676, -97.5164, 8.5, 45.2, 3500.0, 350.0, 'extreme', now()),
  ('Tulsa, OK', 36.1540, -95.9928, 6.3, 38.5, 2800.0, 280.0, 'high', now()),
  ('Norman, OK', 35.2226, -97.4395, 7.1, 42.0, 3200.0, 320.0, 'high', now()),
  ('Wichita, KS', 37.6872, -97.3301, 4.2, 28.0, 1800.0, 180.0, 'moderate', now()),
  ('Dallas, TX', 32.7767, -96.7970, 3.5, 22.0, 1500.0, 140.0, 'moderate', now());