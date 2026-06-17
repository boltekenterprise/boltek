import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function fetchERPNextItems() {
  const erpnextUrl = Deno.env.get("ERPNEXT_URL");
  const erpnextApiKey = Deno.env.get("ERPNEXT_API_KEY");
  const erpnextApiSecret = Deno.env.get("ERPNEXT_API_SECRET");

  if (!erpnextUrl || !erpnextApiKey || !erpnextApiSecret) {
    throw new Error("ERPNext credentials not configured");
  }

  const url = `${erpnextUrl}/api/resource/Item?fields=["name","item_code","item_name","description","standard_rate","stock_uom","disabled"]&filters=[["disabled","=",0]]&limit_page_length=500`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `token ${erpnextApiKey}:${erpnextApiSecret}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ERPNext API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const items = await fetchERPNextItems();

    return new Response(
      JSON.stringify({
        success: true,
        data: items,
        count: items.length,
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
