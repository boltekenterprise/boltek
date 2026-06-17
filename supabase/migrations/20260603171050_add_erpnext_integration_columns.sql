/*
  # Add ERPNext Integration Columns

  1. Modified Tables
    - Add `erpnext_id` and `erpnext_synced_at` columns to quotations table
    - Create `erpnext_sync_log` table for tracking sync operations

  2. New Table
    - `erpnext_sync_log` - Audit trail of ERPNext sync operations
      - `id` (uuid, primary key)
      - `doctype` (text) - Type of document synced (Quotation, etc.)
      - `doc_id` (text) - ERPNext document ID
      - `local_id` (uuid) - Local database ID
      - `status` (text) - success, failed, pending
      - `error_message` (text)
      - `synced_at` (timestamptz)

  3. Indexes
    - On erpnext_sync_log.status for filtering
    - On erpnext_sync_log.synced_at for sorting
*/

-- Add ERPNext tracking columns to quotations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'erpnext_id'
  ) THEN
    ALTER TABLE quotations ADD COLUMN erpnext_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'erpnext_synced_at'
  ) THEN
    ALTER TABLE quotations ADD COLUMN erpnext_synced_at timestamptz;
  END IF;
END $$;

-- Create ERPNext sync log table
CREATE TABLE IF NOT EXISTS erpnext_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctype text NOT NULL,
  doc_id text NOT NULL,
  local_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
  error_message text,
  synced_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_erpnext_sync_log_status ON erpnext_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_erpnext_sync_log_synced_at ON erpnext_sync_log(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_erpnext_sync_log_doctype ON erpnext_sync_log(doctype);
CREATE INDEX IF NOT EXISTS idx_quotations_erpnext_id ON quotations(erpnext_id);

-- Enable RLS
ALTER TABLE erpnext_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for erpnext_sync_log (only admins can view)
CREATE POLICY "Admin users can view sync logs"
  ON erpnext_sync_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can create sync logs"
  ON erpnext_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid::text = auth.uid()::text
    )
  );

CREATE POLICY "Admin users can update sync logs"
  ON erpnext_sync_log FOR UPDATE
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
