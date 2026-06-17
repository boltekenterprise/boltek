# BolteK Enterprise - Complete Role-Based System

## Overview

You now have a **fully functional role-based management system** with 8 different roles, each with specialized dashboards, modules, and permissions.

---

## Roles & Departments

### 1. **CEO/Owner** (Management)
**Full system access. Strategic decisions and oversight.**

**Can Access:**
- All modules and dashboards
- All financial data
- All employee records
- All project management
- All marketing and sales data
- System settings and configurations

**Key Responsibilities:**
- Monitor overall business performance
- Make strategic decisions
- Review financial health
- Approve major purchases
- Oversee all departments

---

### 2. **Accounting Manager** (Accounting)
**Manage expenses, income, VAT, tax, and wages.**

**Dashboard Shows:**
- Total Income (paid invoices)
- Total Expenses (paid expenses)
- Net Profit calculation
- Pending Payroll amount

**Tasks:**
- Create and approve expenses
- Record income from all sources
- Process payroll monthly
- Calculate and file VAT/taxes
- Manage vendor payments
- Generate financial reports

**Data Access:**
- ✓ Full expenses module
- ✓ Full income records module
- ✓ Full payroll module
- ✓ Chart of accounts
- ✓ Invoices and payments
- ✗ Marketing/Sales data (read-only)

---

### 3. **Project Manager** (Operations)
**Track projects, quotations, and vendors with site supervisors.**

**Dashboard Shows:**
- Active Projects (in progress count)
- Completed Projects (this month)
- Budget vs Actual tracking

**Responsibilities:**
- Create new projects from quotations
- Assign site supervisors
- Track project progress
- Manage vendors and suppliers
- Generate project quotes
- Monitor budget vs actual costs
- Track project timelines

**Workflows:**
```
Quotation (Sales) → Project Creation → Assign Supervisor
→ Track Progress → Mark Complete → Generate Invoice
```

---

### 4. **HR Manager** (Human Resources)
**Manage employees, wages, assignments, and records.**

**Dashboard Shows:**
- Total Active Employees
- Monthly Payroll amount (pending)
- Active Project Assignments

**Responsibilities:**
- Add and manage employee records
- Assign employees to projects
- Track project assignments
- Process payroll
- Manage wages and benefits
- View attendance records
- Handle employee changes

**Data Managed:**
- Employee information (name, email, phone, position)
- Department and role assignments
- Salary and banking details
- Date of joining
- Active/Inactive status

---

### 5. **Sales & Marketing Lead** (Sales & Marketing)
**Manage marketing, leads, content, and drive sales.**

**Dashboard Shows:**
- Active Leads (to follow up)
- Marketing Posts (published)
- Google Reviews (latest rating)
- Conversion Rate (this month)

**Responsibilities:**
- Create and manage sales leads
- Track cold calls and conversions
- Create marketing content
- Post on social media
- Design marketing campaigns
- Respond to Google Reviews
- Track lead status (new → quoted → won/lost)

**Marketing Content Types:**
- Facebook posts
- Instagram posts
- LinkedIn updates
- Twitter/X posts
- Blog articles
- Email campaigns
- Brochures
- Videos

**Lead Tracking:**
- Source (Google, referral, cold call, social media, marketing event, website)
- Status (new, contacted, interested, quoted, won, lost, followup)
- Next followup date
- Estimated budget

---

### 6. **Site Supervisor** (Operations)
**On-site project supervision and completion.**

**Can See:**
- Assigned projects
- Project details and progress
- Team members on site
- Daily tasks and checklist

**Responsibilities:**
- Supervise field work
- Ensure quality of work
- Track daily progress
- Report issues/delays
- Update project status
- Manage on-site team
- Complete project forms

---

### 7. **Technician** (Operations)
**Field work and installations.**

**Access:**
- Own project assignments
- Daily work tasks
- Safety checklists

**Responsibilities:**
- Install fire protection systems
- Perform maintenance work
- Conduct trainings
- Complete safety assessments
- Report on work completion

---

### 8. **Accountant (Staff)** (Accounting)
**Data entry for expenses and income.**

**Limited Access:**
- Create expenses (needs approval)
- Record income
- View company expenses/income
- Generate basic reports

**Responsibilities:**
- Enter daily expenses
- Record sales/income
- Support Accounting Manager
- Data entry and verification

---

## Database Tables by Role

### Accounting Department Tables:
```
expenses - Track all company expenses
income_records - Record all income sources
payroll - Manage employee wages
chart_of_accounts - Accounting structure
tax_settings - VAT, tax rates (Nepal)
```

### Project Management Tables:
```
projects - Project tracking
quotations - Customer quotes
vendors - Supplier management
sales_orders - Customer orders
```

### HR/Employee Tables:
```
employees - Employee records
user_roles - Role assignments
roles - Role definitions
payroll - Wage tracking
```

### Sales & Marketing Tables:
```
leads - Sales lead tracking
marketing_content - Social media posts
google_reviews - Customer reviews
projects - Project sources
```

---

## Workflows by Department

### ACCOUNTING WORKFLOW

```
Expense Created (Draft)
    ↓
Submitted for Approval
    ↓
Accounting Manager Approves/Rejects
    ↓
Payment Processed (Cash, Check, Bank Transfer, Credit Card)
    ↓
Recorded in Books
    ↓
VAT/Tax Calculated
```

**Example Expense Categories:**
- Materials (equipment, pipes, etc.)
- Labor (technician wages)
- Transportation (vehicle fuel, travel)
- Utilities (electricity, water)
- Rent (office/warehouse)
- Equipment (tools, machinery)
- Training (staff development)

---

### PROJECT MANAGEMENT WORKFLOW

```
Sales Lead (interested in fire system)
    ↓
Sales Team Prepares Quotation
    ↓
Project Manager Reviews Quotation
    ↓
Client Accepts Quote
    ↓
Create Project
    ↓
Assign Project Manager + Site Supervisor
    ↓
Schedule Start Date
    ↓
Execute Project (ongoing)
    ↓
Track Progress (% complete)
    ↓
Mark Complete
    ↓
Generate Invoice
    ↓
Receive Payment
```

**Project Types:**
- Fire system installation (hydrant, sprinkler, alarm, suppression)
- Fire system maintenance (AMC - Annual Maintenance Contract)
- Training (fire safety training for staff)
- Assessment (fire risk assessment)
- Consulting (fire safety consulting)

---

### HR WORKFLOW

```
New Employee
    ↓
Add to System (with position, salary, contact details)
    ↓
Assign Role & Department
    ↓
Monthly: Calculate Salary
    ↓
Add Bonuses/Deductions if any
    ↓
Process Payroll (Pending → Processed → Paid)
    ↓
Assign to Projects as Needed
    ↓
Track Assignments
```

---

### SALES & MARKETING WORKFLOW

```
Lead Generated (Cold Call, Referral, Google Search, etc.)
    ↓
Record in System with Details
    ↓
Assign to Sales Person
    ↓
Contact Lead (Phone, Email)
    ↓
Track: New → Contacted → Interested
    ↓
Send Quotation
    ↓
Track: Interested → Quoted
    ↓
Follow-up Calls
    ↓
Result: Won or Lost
    ↓
If Won: Create Project
    ↓
If Lost: Mark as Lost & Note Reason
```

**Lead Sources (Cold Calls & Marketing):**
- Google search
- Referrals (existing customers)
- Cold calls (outbound)
- Social media
- Marketing events
- Website inquiries
- Other

---

## Key Features

### Google Reviews Integration
- Display latest customer reviews
- Show ratings
- Respond to reviews
- Featured reviews option
- Language support

### Financial Management
- Income tracking by source (service, product, training, AMC, assessment)
- Expense tracking by category
- VAT/Tax calculation (Nepal rates)
- Profit/Loss calculation
- Monthly payroll processing

### Project Management
- Quote to project conversion
- Budget vs actual tracking
- Progress tracking (% complete)
- Timeline management
- Multi-person team assignments
- Vendor management

### Employee Management
- Employee database
- Role-based assignments
- Project allocations
- Payroll processing
- Wage tracking

### Marketing & Sales
- Lead database with status tracking
- Cold call tracking
- Conversion rate tracking
- Marketing content calendar
- Multi-platform posting (FB, Instagram, LinkedIn, etc.)

---

## Access Control & Security

### RLS Policies:
- ✓ Admin-only access to core modules
- ✓ Role-based dashboard visibility
- ✓ Department-specific data access
- ✓ Project-specific team access
- ✓ Public read access to Google Reviews

### User Assignment Process:
1. Create admin user in Firebase
2. Add to admin_users table in Supabase
3. Assign role via user_roles table
4. User sees role-specific dashboard on login

---

## Using the System

### LOGIN
```
URL: http://localhost:5173/job
Email: your-email@company.com
Password: Firebase password
```

### FIRST TIME SETUP

**As CEO/Admin:**
1. Go to Dashboard → See overview
2. Create Roles (if needed)
3. Add Employees
4. Assign Roles to Employees
5. Create Projects
6. Assign Supervisors

**As Project Manager:**
1. View Dashboard
2. Create Projects from Quotations
3. Assign Site Supervisors
4. Track Progress

**As Accountant:**
1. View Accounting Dashboard
2. Record Expenses/Income
3. Process Payroll
4. Generate Reports

**As Sales & Marketing:**
1. View Dashboard
2. Create Leads
3. Post Marketing Content
4. Track Conversions

---

## Nepal-Specific Setup

### Currency: ₨ (Nepalese Rupee)

### Tax Structure:
- VAT (Value Added Tax)
- Service Tax
- Withholding Tax

### Company Location:
- Kathmandu, Nepal
- Fire safety and protection industry

### Compliance:
- Nepal Building Code (NBC)
- Fire safety regulations
- Labor laws for payroll

---

## Reports & Analytics (Ready in Database)

These reports can be created by querying the database:

**Financial Reports:**
- Monthly P&L Statement
- Expense breakdown by category
- Income by source
- Employee payroll summary
- Tax liability report

**Project Reports:**
- Project status report
- Budget vs actual comparison
- Project timeline report
- Technician utilization

**Sales Reports:**
- Lead conversion rate
- Sales by month
- Lead source analysis
- Cold call success rate

**HR Reports:**
- Employee roster
- Salary summary
- Project assignments
- Staff utilization

---

## Summary

**BolteK Enterprise now has:**
- ✓ 8 specialized roles
- ✓ Role-based dashboards for each department
- ✓ Complete accounting module (expenses, income, payroll, taxes)
- ✓ Project management with team assignments
- ✓ HR module for employee management
- ✓ Sales & Marketing module with Google Reviews
- ✓ Lead tracking with cold call management
- ✓ Marketing content calendar
- ✓ Secure role-based access control
- ✓ Nepal-specific setup
- ✓ Firebase + Supabase integration

---

## Next Steps

1. **Add Employees** - Start with management team
2. **Assign Roles** - Give each person their role
3. **Create Projects** - Add current/upcoming fire safety projects
4. **Record History** - Add past expenses/income
5. **Configure Google Reviews** - Add your Google Reviews API (optional)
6. **Train Team** - Show each department their dashboard

**You're ready to manage your entire fire safety business!**
