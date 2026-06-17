/*
  # Role-Based Access Control & Employee Management

  1. New Tables - Roles, Employees, Projects, Accounting, Sales
*/

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  role_code text UNIQUE NOT NULL,
  description text,
  department text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role_id uuid REFERENCES roles(id),
  department text,
  position text,
  date_of_joining date NOT NULL DEFAULT CURRENT_DATE,
  salary_per_month numeric(12, 2) DEFAULT 0,
  bank_account text,
  contact_address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES admin_users(id),
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(admin_user_id, role_id)
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code text UNIQUE NOT NULL,
  project_name text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  location text NOT NULL,
  project_type text CHECK (project_type IN ('fire_system_installation', 'fire_system_maintenance', 'training', 'assessment', 'consulting')),
  description text,
  quotation_id uuid REFERENCES quotations(id),
  project_manager_id uuid REFERENCES employees(id),
  site_supervisor_id uuid REFERENCES employees(id),
  start_date date,
  end_date date,
  estimated_budget numeric(12, 2),
  actual_cost numeric(12, 2) DEFAULT 0,
  status text CHECK (status IN ('planning', 'quoted', 'ongoing', 'completed', 'invoiced', 'cancelled')) DEFAULT 'planning',
  progress_percentage integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  income_code text UNIQUE NOT NULL,
  income_date date NOT NULL DEFAULT CURRENT_DATE,
  source text CHECK (source IN ('service', 'product_sales', 'training', 'amc', 'assessment', 'other')) NOT NULL,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  project_id uuid REFERENCES projects(id),
  customer_name text NOT NULL,
  payment_received numeric(12, 2) DEFAULT 0,
  status text CHECK (status IN ('quoted', 'invoiced', 'partially_paid', 'paid')) DEFAULT 'quoted',
  notes text,
  recorded_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_code text UNIQUE NOT NULL,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payroll_month date NOT NULL,
  salary_amount numeric(12, 2) NOT NULL,
  bonus numeric(12, 2) DEFAULT 0,
  deductions numeric(12, 2) DEFAULT 0,
  net_amount numeric(12, 2) NOT NULL,
  status text CHECK (status IN ('pending', 'processed', 'paid')) DEFAULT 'pending',
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_code text UNIQUE NOT NULL,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  project_requirement text,
  estimated_budget numeric(12, 2),
  assigned_to uuid REFERENCES employees(id),
  source text CHECK (source IN ('google_search', 'referral', 'cold_call', 'social_media', 'marketing_event', 'website', 'other')),
  status text CHECK (status IN ('new', 'contacted', 'interested', 'quoted', 'won', 'lost', 'followup')) DEFAULT 'new',
  last_contact_date date,
  next_followup_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketing_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_code text UNIQUE NOT NULL,
  content_type text CHECK (content_type IN ('facebook', 'instagram', 'linkedin', 'twitter', 'blog', 'email', 'brochure', 'video')) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  content_body text,
  image_url text,
  video_url text,
  call_to_action text,
  platform text,
  scheduled_date date,
  published_date date,
  status text CHECK (status IN ('draft', 'scheduled', 'published', 'archived')) DEFAULT 'draft',
  created_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id text UNIQUE NOT NULL,
  author text NOT NULL,
  author_profile_photo_url text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_datetime timestamptz,
  response_text text,
  response_datetime timestamptz,
  language text DEFAULT 'en',
  is_featured boolean DEFAULT false,
  synced_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_admin ON user_roles(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_supervisor ON projects(site_supervisor_id);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_income_source ON income_records(source);
CREATE INDEX IF NOT EXISTS idx_income_status ON income_records(status);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll(payroll_month DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_marketing_status ON marketing_content(status);
CREATE INDEX IF NOT EXISTS idx_marketing_type ON marketing_content(content_type);
CREATE INDEX IF NOT EXISTS idx_google_reviews_rating ON google_reviews(rating);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin can view roles" ON roles FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage roles" ON roles FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can view employees" ON employees FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage employees" ON employees FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update employees" ON employees FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can view user roles" ON user_roles FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can assign roles" ON user_roles FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can view projects" ON projects FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage projects" ON projects FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can update projects" ON projects FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can view income" ON income_records FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage income" ON income_records FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can view payroll" ON payroll FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage payroll" ON payroll FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can view leads" ON leads FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage leads" ON leads FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admin can view marketing" ON marketing_content FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admin can manage marketing" ON marketing_content FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Public can view reviews" ON google_reviews FOR SELECT USING (true);
CREATE POLICY "Admin can manage reviews" ON google_reviews FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- Insert Initial Roles
INSERT INTO roles (role_name, role_code, description, department) VALUES
  ('CEO/Owner', 'ceo', 'Full system access and strategic decisions', 'Management'),
  ('Accounting Manager', 'accountant', 'Manage expenses, income, VAT, tax, wages', 'Accounting'),
  ('Project Manager', 'project_manager', 'Track projects, quotes, vendors, ensure completion', 'Operations'),
  ('HR Manager', 'hr_manager', 'Manage wages, assignments, employee records', 'Human Resources'),
  ('Sales & Marketing Lead', 'sales_marketing', 'Content, marketing campaigns, leads, sales tracking', 'Sales & Marketing'),
  ('Site Supervisor', 'site_supervisor', 'On-site project supervision and completion', 'Operations'),
  ('Technician', 'technician', 'Field work and installations', 'Operations'),
  ('Accountant (Staff)', 'accountant_staff', 'Data entry for expenses and income', 'Accounting')
ON CONFLICT DO NOTHING;
