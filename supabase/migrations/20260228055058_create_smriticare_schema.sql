/*
  # SmritiCare Database Schema

  ## Overview
  Complete database schema for SmritiCare - AI Memory and Safety Companion for Alzheimer's Patients.
  This migration creates all necessary tables with proper relationships and security policies.

  ## New Tables

  ### 1. `guardians`
  Stores guardian/caregiver information who manage patients
  - `id` (uuid, primary key) - Unique identifier for guardian
  - `name` (text) - Full name of the guardian
  - `email` (text, unique) - Email address for login
  - `password` (text) - Hashed password for authentication
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `patients`
  Stores patient information with medical details
  - `id` (uuid, primary key) - Unique identifier for patient
  - `guardian_id` (uuid, foreign key) - Reference to guardian
  - `name` (text) - Patient's full name
  - `age` (integer) - Patient's age
  - `medical_condition` (text) - Primary medical condition/diagnosis
  - `guardian_phone` (text) - Guardian's emergency contact number
  - `address` (text) - Patient's residential address
  - `photo_url` (text) - URL to patient's photo
  - `qr_code_id` (uuid, unique) - Unique ID for QR code identification
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `emergency_contacts`
  Stores emergency contact information for patients
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Reference to patient
  - `name` (text) - Contact person's name
  - `phone` (text) - Contact phone number
  - `relationship` (text) - Relationship to patient
  - `priority` (integer) - Contact priority order (1 = highest)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `locations`
  Tracks patient location history for safety monitoring
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Reference to patient
  - `latitude` (decimal) - Geographic latitude coordinate
  - `longitude` (decimal) - Geographic longitude coordinate
  - `timestamp` (timestamptz) - Location capture timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `schedules`
  Manages patient schedules for medications, meals, and activities
  - `id` (uuid, primary key) - Unique identifier
  - `patient_id` (uuid, foreign key) - Reference to patient
  - `title` (text) - Schedule item title
  - `description` (text) - Detailed description
  - `schedule_time` (timestamptz) - Scheduled time for activity
  - `type` (text) - Schedule type: 'medicine', 'meal', 'sleep', or 'other'
  - `completed` (boolean) - Completion status
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  All tables have Row Level Security (RLS) enabled with restrictive policies:
  - Guardians can only access their own data
  - Patients, locations, schedules, and emergency contacts are accessible only to the associated guardian
  - No public access is allowed without authentication
  
  ## Indexes

  Foreign key indexes are created for optimal query performance on:
  - patient_id lookups across all related tables
  - guardian_id lookups in patients table
  - QR code ID lookups for quick patient identification
*/

-- Create guardians table
CREATE TABLE IF NOT EXISTS guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL,
  medical_condition text NOT NULL,
  guardian_phone text NOT NULL,
  address text NOT NULL,
  photo_url text DEFAULT '',
  qr_code_id uuid UNIQUE DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  schedule_time timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('medicine', 'meal', 'sleep', 'other')),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_guardian_id ON patients(guardian_id);
CREATE INDEX IF NOT EXISTS idx_patients_qr_code_id ON patients(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient_id ON emergency_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_locations_patient_id ON locations(patient_id);
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_patient_id ON schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_schedules_time ON schedules(schedule_time);

-- Enable Row Level Security on all tables
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guardians table
CREATE POLICY "Guardians can view own profile"
  ON guardians FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Guardians can update own profile"
  ON guardians FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for patients table
CREATE POLICY "Guardians can view own patients"
  ON patients FOR SELECT
  TO authenticated
  USING (guardian_id = auth.uid());

CREATE POLICY "Guardians can create patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY "Guardians can update own patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (guardian_id = auth.uid())
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY "Guardians can delete own patients"
  ON patients FOR DELETE
  TO authenticated
  USING (guardian_id = auth.uid());

-- RLS Policies for emergency_contacts table
CREATE POLICY "Guardians can view patient emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = emergency_contacts.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can create patient emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = emergency_contacts.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can update patient emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = emergency_contacts.patient_id
      AND patients.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = emergency_contacts.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can delete patient emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = emergency_contacts.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

-- RLS Policies for locations table
CREATE POLICY "Guardians can view patient locations"
  ON locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = locations.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can create patient locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = locations.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

-- RLS Policies for schedules table
CREATE POLICY "Guardians can view patient schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = schedules.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can create patient schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = schedules.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can update patient schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = schedules.patient_id
      AND patients.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = schedules.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can delete patient schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = schedules.patient_id
      AND patients.guardian_id = auth.uid()
    )
  );