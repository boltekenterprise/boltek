# BolteK Enterprise - ERPNext Integration Setup Guide

## Overview
This guide walks you through integrating ERPNext with the BolteK Enterprise admin portal for managing inventory, accounting, quotations, and business operations.

---

## Part 1: ERPNext Server Setup

### Option A: Self-Hosted ERPNext (Recommended for Nepal)

#### 1. Install ERPNext on Your Server

**Prerequisites:**
- Ubuntu 20.04 LTS or later
- Python 3.8+
- Node.js 14+
- PostgreSQL 12+
- MariaDB 10.3+ (or MySQL 5.7+)

**Quick Install:**

```bash
# Clone ERPNext installer
git clone https://github.com/frappe/bench.git
cd bench

# Install dependencies
pip install -r requirements.txt

# Create a new bench directory
bench init erpnext-bench
cd erpnext-bench

# Create a new ERPNext site
bench new-site boltek.local --db-type mariadb

# Download ERPNext app
bench get-app erpnext https://github.com/frappe/erpnext

# Install ERPNext on your site
bench --site boltek.local install-app erpnext

# Start the bench
bench start
```

Access at: `http://localhost:8000` or your domain

**User:** Administrator
**Password:** (check console output)

#### 2. Configure ERPNext Company

1. Login to ERPNext as Administrator
2. Go to **Setup** → **Company**
3. Create new company:
   - **Company Name:** BolteK Enterprise
   - **Abbr:** BK
   - **Country:** Nepal
   - **Default Currency:** NPR (Nepalese Rupee)
   - **Chart of Accounts:** Nepal (if available) or Nepal-specific setup

#### 3. Create Item Category

1. Go to **Inventory** → **Item**
2. Create items for your services:

| Item Code | Item Name | Category | Standard Rate |
|-----------|-----------|----------|----------------|
| FHS-001 | Fire Hydrant System | Fire Protection | 50,000 |
| FSS-001 | Fire Sprinkler System | Fire Protection | 45,000 |
| FAS-001 | Fire Alarm System | Fire Protection | 35,000 |
| FSS-002 | Fire Suppression System | Fire Protection | 60,000 |
| AMC-001 | Annual Maintenance Contract | Services | 20,000 |
| TST-001 | Fire Safety Training | Services | 15,000 |
| FRA-001 | Fire Risk Assessment | Services | 25,000 |

**For each item:**
- **Item Code:** Code from table above
- **Item Name:** Name from table above
- **Item Group:** Service
- **Unit of Measure:** Nos (Numbers)
- **Standard Rate:** Price from table above
- **Enable in Quotation:** Yes

#### 4. Create Custom Fields (Optional but Recommended)

This allows storing Nepal-specific data:

1. Go to **Setup** → **Customize Form** → **Quotation**
2. Add fields:

```
Field Label: Building Type
Field Name: custom_building_type
Field Type: Select
Options: Hotel\nHospital\nCommercial\nIndustrial\nOffice\nResidential

Field Label: Project Location
Field Name: custom_location
Field Type: Data
```

3. Click **Save**

#### 5. Enable API Access

1. Go to **Setup** → **User** → Administrator
2. Scroll to **API Access** section
3. Click **Generate API Secret**
4. Copy the **API Key** and **API Secret**

---

## Part 2: Configure BolteK Application

### 1. Set Environment Variables

Update your `.env` file with ERPNext credentials:

```env
# ERPNext Configuration
VITE_ERPNEXT_URL=https://your-erpnext-domain.com
VITE_ERPNEXT_API_KEY=your_api_key_here
VITE_ERPNEXT_API_SECRET=your_api_secret_here
VITE_ERPNEXT_COMPANY=BolteK Enterprise
```

**Important:** Never commit `.env` to git!

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Test ERPNext Connection

1. Navigate to `/job` admin portal
2. Login with Firebase credentials
3. Go to **Quotations** tab
4. Check status bar - should show "✓ ERPNext Connected"

---

## Part 3: Using ERPNext Integration

### Creating and Syncing Quotations

#### Step 1: Create Quotation in Admin Portal

1. Go to **Quotations** tab
2. Click **New Quotation**
3. Fill in:
   - Client Name
   - Email
   - Phone
   - Building Type (Hotel, Hospital, etc.)
   - Location
   - Select services
   - Description
   - Set Status: "Sent"
4. Click **Create Quotation**

#### Step 2: Sync to ERPNext

Once quotation is created and marked as "Sent":

1. A **Sync** button (⚡) appears next to the quotation
2. Click to automatically:
   - Create/find customer in ERPNext
   - Create quotation with all items
   - Link building type and location as custom fields
   - Store ERPNext Quotation ID in database

After sync, you'll see:
- Purple badge showing ERPNext Quotation ID
- Timestamp of sync

#### Step 3: Manage in ERPNext

1. Login to ERPNext
2. Go to **Selling** → **Quotation**
3. Find your quotation (matches customer name)
4. From here you can:
   - Add additional line items
   - Apply discounts
   - Convert to Sales Order
   - Send to customer via email
   - Track acceptance/rejection

---

## Part 4: ERPNext Features Available

### Quotations/Sales Orders
- ✅ Auto-create quotations in ERPNext
- ✅ Customer management
- ✅ Line items with pricing
- ✅ Custom fields (Building Type, Location)
- ✅ Status tracking
- ⏳ Future: Auto-convert to Sales Orders

### Inventory Management (Future)
- Fetch items from ERPNext into BolteK
- Track stock levels
- Auto-update pricing from ERPNext
- Manage item descriptions

### Accounting (Future)
- Link quotations to cost centers
- Track invoicing
- Generate financial reports
- Nepal-specific compliance

### Customer Management (Future)
- Sync customer details
- Track payment history
- Manage address book

---

## Part 5: Database Schema

### Tables for ERPNext Integration

**quotations** (updated):
```sql
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS erpnext_id text;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS erpnext_synced_at timestamptz;
```

**erpnext_sync_log** (optional):
```sql
CREATE TABLE IF NOT EXISTS erpnext_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctype text,
  doc_id text,
  local_id uuid,
  status text CHECK (status IN ('success', 'failed', 'pending')),
  error_message text,
  synced_at timestamptz DEFAULT now()
);
```

---

## Part 6: Troubleshooting

### "ERPNext Not Connected"

**Problem:** Status shows "ERPNext Not Connected"

**Solution:**
1. Verify `.env` variables are correct
2. Check ERPNext server is running: `http://your-erpnext-domain.com`
3. Verify API credentials:
   - Login to ERPNext
   - Go to User → Administrator
   - Check API Key/Secret are valid
4. Restart dev server: `npm run dev`

### "Sync Failed: 401 Unauthorized"

**Problem:** API authentication fails

**Solution:**
1. Regenerate API credentials in ERPNext:
   - Go to **Setup** → **User** → Administrator
   - Delete old API secret
   - Generate new one
   - Copy exactly to `.env`
2. Ensure no trailing spaces in `.env`
3. Restart dev server

### "Failed to create customer in ERPNext"

**Problem:** Customer creation fails during sync

**Solution:**
1. Verify customer group exists:
   - In ERPNext go to **Selling** → **Customer Group**
   - Create "All Customer Groups" if missing
2. Verify territory exists:
   - Go to **Setup** → **Territory**
   - Create "Nepal" territory
3. Check customer name is unique

### Quotation Created but Not Syncing

**Problem:** Sync button doesn't appear

**Solution:**
1. Quotation must have Status = "Sent"
2. Verify ERPNext is connected (green status)
3. Check browser console for errors (F12)
4. Try refreshing page

---

## Part 7: Advanced Configuration

### Using ERPNext on Existing Server

If you already have ERPNext:

1. Get API credentials from your administrator
2. Add these to `.env`
3. Verify items exist in your ERPNext instance
4. Test sync

### Multi-Site Setup

If running multiple ERPNext sites:

```env
# Use site-specific credentials
VITE_ERPNEXT_URL=https://your-domain.com/
```

### Webhook Integration (Future)

ERPNext can send webhooks when quotations change:

1. Setup → Webhook
2. Create webhook to BolteK API
3. Automatically sync status changes

---

## Part 8: Security Best Practices

- ✅ Never commit `.env` to git
- ✅ Use strong passwords for ERPNext admin
- ✅ Enable 2FA on ERPNext admin account
- ✅ Use HTTPS for all connections
- ✅ Limit API key permissions (create dedicated user if possible)
- ✅ Regularly rotate API credentials
- ✅ Monitor sync logs for errors

---

## Part 9: API Reference

### Sync Quotation to ERPNext

**Endpoint:** `POST /functions/v1/sync-quotation-to-erpnext`

**Payload:**
```json
{
  "id": "quotation-uuid",
  "client_name": "Royal Tulip Hotel",
  "client_email": "info@royaltulip.com",
  "client_phone": "+977-1-4123456",
  "building_type": "Hotel",
  "location": "Kathmandu",
  "services": [
    { "name": "Fire Hydrant System", "price": 50000 },
    { "name": "Fire Alarm System", "price": 35000 }
  ],
  "total_amount": 85000,
  "description": "Complete fire protection system"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quotation synced to ERPNext",
  "data": {
    "name": "QTN-2025-00001",
    "doctype": "Quotation",
    "customer": "Royal Tulip Hotel"
  }
}
```

### Fetch Items from ERPNext

**Endpoint:** `GET /functions/v1/fetch-erpnext-items`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "FHS-001",
      "item_code": "FHS-001",
      "item_name": "Fire Hydrant System",
      "description": "Complete fire hydrant system installation",
      "standard_rate": 50000,
      "stock_uom": "Nos",
      "disabled": 0
    }
  ],
  "count": 7
}
```

---

## Part 10: Getting Help

**Resources:**
- ERPNext Documentation: https://docs.erpnext.com
- Frappe Framework Docs: https://frappe.io/docs/user/en
- Nepal User Group: https://nepal.erpnext.com

**Common Queries:**
- ERPNext Community: https://discuss.erpnext.com
- Search: "ERPNext Nepal" for region-specific help

---

## Summary

You now have:
- ✅ ERPNext backend for quotations
- ✅ Automatic customer creation
- ✅ Service item management
- ✅ Nepal-specific company setup
- ✅ Real-time sync with admin portal
- ✅ Foundation for inventory & accounting

Next steps:
1. Create more items/services in ERPNext
2. Setup quotation templates
3. Configure payment terms
4. Enable email notifications
5. Explore inventory management features
