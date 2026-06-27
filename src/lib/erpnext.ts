/**
 * ERPNext API Integration
 * Connects to ERPNext server for inventory, quotations, and accounting
 */

const ERPNEXT_BASE_URL = process.env.VITE_ERPNEXT_URL || process.env.NEXT_PUBLIC_VITE_ERPNEXT_URL || '';
const ERPNEXT_API_KEY = process.env.VITE_ERPNEXT_API_KEY || process.env.NEXT_PUBLIC_VITE_ERPNEXT_API_KEY || '';
const ERPNEXT_API_SECRET = process.env.VITE_ERPNEXT_API_SECRET || process.env.NEXT_PUBLIC_VITE_ERPNEXT_API_SECRET || '';

interface ERPNextResponse<T> {
  data: T;
  message?: string;
}

interface QuotationItem {
  item_code: string;
  item_name: string;
  qty: number;
  rate: number;
  amount: number;
}

interface ERPNextQuotation {
  doctype: 'Quotation';
  customer_name: string;
  customer_email?: string;
  contact_mobile?: string;
  address_display?: string;
  items: QuotationItem[];
  total_qty: number;
  total: number;
  grand_total: number;
  status: 'Draft' | 'Open' | 'Accepted' | 'Rejected';
  custom_project_location?: string;
  custom_building_type?: string;
}

interface ERPNextItem {
  name: string;
  item_code: string;
  item_name: string;
  description?: string;
  standard_rate: number;
  stock_uom: string;
  disabled: number;
}

class ERPNextClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private isConfigured: boolean;

  constructor() {
    this.baseUrl = ERPNEXT_BASE_URL;
    this.apiKey = ERPNEXT_API_KEY;
    this.apiSecret = ERPNEXT_API_SECRET;
    this.isConfigured = !!(this.baseUrl && this.apiKey && this.apiSecret);
  }

  /**
   * Check if ERPNext is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Get authorization header (Basic Auth for ERPNext)
   */
  private getAuthHeader(): HeadersInit {
    if (!this.isConfigured) {
      throw new Error('ERPNext is not configured. Check .env variables.');
    }

    const credentials = btoa(`${this.apiKey}:${this.apiSecret}`);
    return {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make API request to ERPNext
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ERPNextResponse<T>> {
    const url = `${this.baseUrl}/api/resource/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: this.getAuthHeader(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `ERPNext API Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get list of items with filters
   */
  async getItems(filters?: Record<string, any>): Promise<ERPNextItem[]> {
    const params = new URLSearchParams();
    params.append('fields', '["name","item_code","item_name","description","standard_rate","stock_uom","disabled"]');
    params.append('filters', JSON.stringify([['Item', 'disabled', '=', 0]]));
    params.append('limit_page_length', '500');

    const response = await fetch(
      `${this.baseUrl}/api/resource/Item?${params}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch items');
    const result = await response.json();
    return result.data || [];
  }

  /**
   * Create a quotation in ERPNext
   */
  async createQuotation(quotation: ERPNextQuotation): Promise<any> {
    return this.request('POST', 'Quotation', quotation);
  }

  /**
   * Update existing quotation
   */
  async updateQuotation(quotationId: string, data: Partial<ERPNextQuotation>): Promise<any> {
    return this.request('PUT', `Quotation/${quotationId}`, data);
  }

  /**
   * Get quotation by ID
   */
  async getQuotation(quotationId: string): Promise<any> {
    return this.request('GET', `Quotation/${quotationId}`);
  }

  /**
   * Convert quotation to sales order
   */
  async convertQuotationToSalesOrder(quotationId: string): Promise<any> {
    const url = `${this.baseUrl}/api/method/frappe.client.get_value`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({
        doctype: 'Quotation',
        filters: { name: quotationId },
        fieldname: 'name',
      }),
    });

    if (!response.ok) throw new Error('Failed to convert quotation');
    return response.json();
  }

  /**
   * Get customers
   */
  async getCustomers(): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/api/resource/Customer?fields=["name","customer_name","customer_type","email_id","phone"]&limit_page_length=100`,
      { headers: this.getAuthHeader() }
    );

    if (!response.ok) throw new Error('Failed to fetch customers');
    const result = await response.json();
    return result.data || [];
  }

  /**
   * Create or get customer
   */
  async getOrCreateCustomer(email: string, name: string): Promise<string> {
    try {
      // Try to get existing customer by email
      const response = await fetch(
        `${this.baseUrl}/api/resource/Customer?filters=[["email_id","=","${email}"]]`,
        { headers: this.getAuthHeader() }
      );

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        return result.data[0].name;
      }

      // Create new customer
      const createResponse = await this.request<any>('POST', 'Customer', {
        doctype: 'Customer',
        customer_name: name,
        email_id: email,
        customer_type: 'Individual',
      });

      return createResponse.data.name;
    } catch (err) {
      console.error('Error managing customer:', err);
      throw err;
    }
  }

  /**
   * Get financial accounts
   */
  async getAccounts(): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/api/resource/Account?fields=["name","account_name","account_type"]&limit_page_length=100`,
      { headers: this.getAuthHeader() }
    );

    if (!response.ok) throw new Error('Failed to fetch accounts');
    const result = await response.json();
    return result.data || [];
  }

  /**
   * Get company settings
   */
  async getCompany(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/resource/Company?fields=["name","company_name"]&limit_page_length=1`,
      { headers: this.getAuthHeader() }
    );

    if (!response.ok) throw new Error('Failed to fetch company');
    const result = await response.json();
    return result.data?.[0];
  }
}

export const erpNextClient = new ERPNextClient();
export type { ERPNextQuotation, ERPNextItem, QuotationItem };
