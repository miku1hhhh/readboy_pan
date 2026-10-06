export const onRequest: PagesFunction = async (context) => {
  // CORS 预检
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const response = await context.next();
    const newHeaders = new Headers(response.headers);
    for (const [k, v] of Object.entries(corsHeaders())) {
      newHeaders.set(k, v);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || '服务器内部错误' },
      { status: 500, headers: corsHeaders() }
    );
  }
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
