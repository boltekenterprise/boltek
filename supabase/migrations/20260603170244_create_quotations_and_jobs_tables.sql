/*
  # Create Quotations and Internal Jobs Tables

  1. New Tables
    - `quotations` - Store all generated quotations
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `client_email` (text)
      - `client_phone` (text)
      - `building_type` (text)
      - `services` (jsonb)
      - `location` (text)
      - `total_amount` (numeric)
      - `description` (text)
      - `status` (text)
      - `created_at`, `updated_at` (timestamp)
    
    - `internal_tasks` - Track internal routine work
      - `id` (uuid, primary key)
      - `title`, `description`, `category`, `priority`
      - `assigned_to` (text)
      - `status` (text)
      - `due_date` (date)
      - `created_at`, `updated_at` (timestamp)
    
    - `admin_users` - Authorized admin accounts
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `firebase_uid` (text, unique)
      - `role` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Only authenticated admins can access
    - firebase_uid matches auth.uid()

  3. Indexes
    - On status, timestamps, due_date for efficient filtering
*/

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  building_type text,
  services jsonb DEFAULT '[]'::jsonb,
  location text,
  total_amount numeric(10, 2) DEFAULT 0,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create internal_tasks table
CREATE TABLE IF NOT EXISTS internal_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'maintenance' CHECK (category IN ('maintenance', 'installation', 'training', 'site_visit', 'follow_up')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  firebase_uid text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_tasks_status ON internal_tasks(status);
CREATE INDEX IF NOT EXISTS idx_internal_tasks_due_date ON internal_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_admin_users_firebase_uid ON admin_users(firebase_uid);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations
CREATE POLICY "Admin users can view all quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can create quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can update quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

-- RLS Policies for internal_tasks
CREATE POLICY "Admin users can view all tasks"
  ON internal_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can create tasks"
  ON internal_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can update tasks"
  ON internal_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can delete tasks"
  ON internal_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admin users can view admin list"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );
