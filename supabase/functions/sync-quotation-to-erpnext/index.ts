import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuotationData {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  building_type: string;
  location: string;
  services: { name: string; price: number }[];
  total_amount: number;
  description: string;
  status: string;
}

async function syncQuotationToERPNext(quotation: QuotationData) {
  const erpnextUrl = Deno.env.get("ERPNEXT_URL");
  const erpnextApiKey = Deno.env.get("ERPNEXT_API_KEY");
  const erpnextApiSecret = Deno.env.get("ERPNEXT_API_SECRET");
  const company = Deno.env.get("ERPNEXT_COMPANY") || "BolteK Enterprise";

  if (!erpnextUrl || !erpnextApiKey || !erpnextApiSecret) {
    throw new Error("ERPNext credentials not configured");
  }

  // Get or create customer
  const customerEmail = quotation.client_email;
  const customerName = quotation.client_name;

  // Search for existing customer by email
  const customerSearchUrl = `${erpnextUrl}/api/resource/Customer?filters=[["email_id","=","${customerEmail}"]]&fields=["name"]`;
  const customerSearchRes = await fetch(customerSearchUrl, {
    method: "GET",
    headers: {
      Authorization: `token ${erpnextApiKey}:${erpnextApiSecret}`,
      "Content-Type": "application/json",
    },
  });

  let customerId = null;

  if (customerSearchRes.ok) {
    const customerData = await customerSearchRes.json();
    if (customerData.data && customerData.data.length > 0) {
      customerId = customerData.data[0].name;
    }
  }

  // Create customer if not found
  if (!customerId) {
    const createCustomerRes = await fetch(`${erpnextUrl}/api/resource/Customer`, {
      method: "POST",
      headers: {
        Authorization: `token ${erpnextApiKey}:${erpnextApiSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctype: "Customer",
        customer_name: customerName,
        email_id: customerEmail,
        phone: quotation.client_phone,
        customer_type: "Individual",
        customer_group: "All Customer Groups",
        territory: "Nepal",
      }),
    });

    if (!createCustomerRes.ok) {
      console.error("Failed to create customer", await createCustomerRes.text());
      throw new Error("Failed to create customer in ERPNext");
    }

    const createdCustomer = await createCustomerRes.json();
    customerId = createdCustomer.data.name;
  }

  // Map services to quotation items
  const items = quotation.services.map((service: any) => ({
    item_code: service.name.toLowerCase().replace(/\s+/g, "-"),
    item_name: service.name,
    description: service.name,
    qty: 1,
    uom: "Nos",
    rate: service.price,
    amount: service.price,
  }));

  // Create quotation in ERPNext
  const quotationPayload = {
    doctype: "Quotation",
    customer: customerId,
    quotation_to: "Customer",
    order_type: "Sales",
    transaction_date: new Date().toISOString().split("T")[0],
    company: company,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: items,
    custom_location: quotation.location,
    custom_building_type: quotation.building_type,
    remarks: quotation.description,
    docstatus: 0,
  };

  const createQuotRes = await fetch(`${erpnextUrl}/api/resource/Quotation`, {
    method: "POST",
    headers: {
      Authorization: `token ${erpnextApiKey}:${erpnextApiSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quotationPayload),
  });

  if (!createQuotRes.ok) {
    const errorText = await createQuotRes.text();
    console.error("Failed to create quotation", errorText);
    throw new Error("Failed to create quotation in ERPNext");
  }

  const erpnextQuotation = await createQuotRes.json();
  return erpnextQuotation.data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const quotation: QuotationData = await req.json();

    if (!quotation.id || !quotation.client_name || !quotation.client_email) {
      return new Response(
        JSON.stringify({ error: "Missing required quotation fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await syncQuotationToERPNext(quotation);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quotation synced to ERPNext",
        data: result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
