/*
  # Complete Internal ERP System

  1. New Tables
    - `items` - Product/Service inventory
    - `warehouses` - Storage locations
    - `stock_levels` - Current inventory
    - `vendors` - Supplier management
    - `chart_of_accounts` - Accounting structure
    - `sales_orders` - Customer orders
    - `purchase_orders` - Vendor orders
    - `invoices` - Customer billing
    - `payments` - Payment tracking
    - `expenses` - Operating expenses
    - `tax_settings` - Tax rates for Nepal

  2. Security
    - Enable RLS on all tables
    - Only authenticated admins can access

  3. Indexes
    - On frequently queried fields for performance
*/

-- ============================================
-- INVENTORY MANAGEMENT
-- ============================================

-- Items/Services catalog
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  item_name text NOT NULL,
  item_type text CHECK (item_type IN ('product', 'service', 'raw_material')) DEFAULT 'service',
  category text,
  description text,
  unit_of_measure text DEFAULT 'Nos',
  cost_price numeric(12, 2) DEFAULT 0,
  selling_price numeric(12, 2) DEFAULT 0,
  min_stock_level integer DEFAULT 0,
  is_taxable boolean DEFAULT true,
  tax_rate numeric(5, 2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Warehouses/Storage locations
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_code text UNIQUE NOT NULL,
  warehouse_name text NOT NULL,
  location text,
  warehouse_type text CHECK (warehouse_type IN ('main', 'branch', 'transit')) DEFAULT 'main',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Stock levels by warehouse
CREATE TABLE IF NOT EXISTS stock_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  warehouse_id uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity_in_hand integer DEFAULT 0,
  quantity_reserved integer DEFAULT 0,
  quantity_available integer GENERATED ALWAYS AS (quantity_in_hand - quantity_reserved) STORED,
  reorder_level integer DEFAULT 10,
  last_stock_check timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(item_id, warehouse_id)
);

-- ============================================
-- VENDOR & PURCHASING
-- ============================================

-- Vendors/Suppliers
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code text UNIQUE NOT NULL,
  vendor_name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  country text DEFAULT 'Nepal',
  payment_terms text,
  tax_id text,
  bank_account text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  po_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12, 2) DEFAULT 0,
  tax_amount numeric(12, 2) DEFAULT 0,
  total_amount numeric(12, 2) DEFAULT 0,
  status text CHECK (status IN ('draft', 'submitted', 'received', 'cancelled')) DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- SALES & ORDERS
-- ============================================

-- Sales Orders (from quotations)
CREATE TABLE IF NOT EXISTS sales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  so_number text UNIQUE NOT NULL,
  customer_id text,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  so_date date NOT NULL DEFAULT CURRENT_DATE,
  delivery_date date,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12, 2) DEFAULT 0,
  tax_amount numeric(12, 2) DEFAULT 0,
  total_amount numeric(12, 2) DEFAULT 0,
  status text CHECK (status IN ('draft', 'confirmed', 'invoiced', 'delivered', 'cancelled')) DEFAULT 'draft',
  notes text,
  quotation_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- ACCOUNTING
-- ============================================

-- Chart of Accounts (Nepal compliant)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code text UNIQUE NOT NULL,
  account_name text NOT NULL,
  account_type text CHECK (account_type IN (
    'bank', 'cash', 'receivable', 'payable', 'asset', 'liability',
    'equity', 'income', 'expense', 'tax'
  )) NOT NULL,
  account_group text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  so_id uuid REFERENCES sales_orders(id),
  customer_name text NOT NULL,
  customer_email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12, 2) DEFAULT 0,
  tax_amount numeric(12, 2) DEFAULT 0,
  discount numeric(12, 2) DEFAULT 0,
  total_amount numeric(12, 2) DEFAULT 0,
  paid_amount numeric(12, 2) DEFAULT 0,
  status text CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number text UNIQUE NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  invoice_id uuid REFERENCES invoices(id),
  payment_method text CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'mobile_money')) DEFAULT 'bank_transfer',
  amount_paid numeric(12, 2) NOT NULL,
  reference_number text,
  bank_account text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_number text UNIQUE NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  account_id uuid REFERENCES chart_of_accounts(id),
  category text,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  payment_method text,
  vendor_name text,
  attached_receipt text,
  status text CHECK (status IN ('draft', 'submitted', 'approved', 'paid')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- TAX CONFIGURATION
-- ============================================

-- Tax settings (VAT/GST rates for Nepal)
CREATE TABLE IF NOT EXISTS tax_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_type text UNIQUE NOT NULL CHECK (tax_type IN ('vat', 'service_tax', 'withholding_tax')),
  tax_name text NOT NULL,
  tax_rate numeric(5, 2) NOT NULL,
  applicable_from date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_items_code ON items(item_code);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_item ON stock_levels(item_id);
CREATE INDEX IF NOT EXISTS idx_vendors_code ON vendors(vendor_code);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(po_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(so_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(so_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_account ON expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - ADMIN ACCESS ONLY
-- ============================================

-- Create policy helper function for admin check
CREATE OR REPLACE FUNCTION is_admin(user_uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.firebase_uid::text = user_uid::text
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Items policies
CREATE POLICY "Admin can view items" ON items FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can insert items" ON items FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update items" ON items FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can delete items" ON items FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Warehouses policies
CREATE POLICY "Admin can view warehouses" ON warehouses FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage warehouses" ON warehouses FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- Stock levels policies
CREATE POLICY "Admin can view stock" ON stock_levels FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage stock" ON stock_levels FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update stock" ON stock_levels FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Vendors policies
CREATE POLICY "Admin can view vendors" ON vendors FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage vendors" ON vendors FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update vendors" ON vendors FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Purchase Orders policies
CREATE POLICY "Admin can view PO" ON purchase_orders FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage PO" ON purchase_orders FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update PO" ON purchase_orders FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can delete PO" ON purchase_orders FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Sales Orders policies
CREATE POLICY "Admin can view SO" ON sales_orders FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage SO" ON sales_orders FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update SO" ON sales_orders FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can delete SO" ON sales_orders FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Chart of Accounts policies
CREATE POLICY "Admin can view accounts" ON chart_of_accounts FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage accounts" ON chart_of_accounts FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- Invoices policies
CREATE POLICY "Admin can view invoices" ON invoices FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update invoices" ON invoices FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can delete invoices" ON invoices FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Payments policies
CREATE POLICY "Admin can view payments" ON payments FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage payments" ON payments FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- Expenses policies
CREATE POLICY "Admin can view expenses" ON expenses FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update expenses" ON expenses FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Tax Settings policies (read-only for operational use)
CREATE POLICY "Admin can view tax settings" ON tax_settings FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage tax settings" ON tax_settings FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
