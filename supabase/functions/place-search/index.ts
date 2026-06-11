const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get('q')?.trim();

  if (!query) {
    return jsonResponse({ error: 'Use q for place search.' }, 400);
  }

  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    limit: '5',
    addressdetails: '1',
    dedupe: '1',
    'accept-language': 'pt-BR'
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      'User-Agent': 'Legue-e-Leozinho-love-map/1.0',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    return jsonResponse({ error: 'Place search failed.' }, response.status);
  }

  const data = await response.json();

  return jsonResponse({
    results: (Array.isArray(data) ? data : []).map((place: Record<string, unknown>) => ({
      id: `${place.osm_type || ''}-${place.osm_id || ''}`,
      name: String(place.name || ''),
      display_name: String(place.display_name || ''),
      lat: String(place.lat || ''),
      lon: String(place.lon || ''),
      osm_id: String(place.osm_id || ''),
      osm_type: String(place.osm_type || '')
    }))
  });
});
