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

function normalizePoster(poster: string | undefined) {
  return poster && poster !== 'N/A' ? poster : '';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const omdbApiKey = Deno.env.get('OMDB_API_KEY');
  if (!omdbApiKey) {
    return jsonResponse({ error: 'OMDB_API_KEY is not configured.' }, 500);
  }

  const requestUrl = new URL(request.url);
  const movieId = requestUrl.searchParams.get('id');
  const query = requestUrl.searchParams.get('q');
  const year = requestUrl.searchParams.get('y');

  const omdbParams = new URLSearchParams({
    apikey: omdbApiKey,
    type: 'movie'
  });

  if (movieId) {
    omdbParams.set('i', movieId);
    omdbParams.set('plot', 'short');
  } else if (query) {
    omdbParams.set('s', query);
    if (year) omdbParams.set('y', year);
  } else {
    return jsonResponse({ error: 'Use q for search or id for details.' }, 400);
  }

  const omdbResponse = await fetch(`https://www.omdbapi.com/?${omdbParams.toString()}`);
  const omdbData = await omdbResponse.json();

  if (omdbData.Response === 'False') {
    return jsonResponse({ error: omdbData.Error || 'Movie not found.' }, 404);
  }

  if (movieId) {
    return jsonResponse({
      id: omdbData.imdbID,
      imdbID: omdbData.imdbID,
      title: omdbData.Title,
      year: omdbData.Year,
      poster: normalizePoster(omdbData.Poster),
      genre: omdbData.Genre !== 'N/A' ? omdbData.Genre : '',
      runtime: omdbData.Runtime !== 'N/A' ? omdbData.Runtime : '',
      plot: omdbData.Plot !== 'N/A' ? omdbData.Plot : ''
    });
  }

  return jsonResponse({
    results: (omdbData.Search || []).map((movie: Record<string, string>) => ({
      id: movie.imdbID,
      imdbID: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: normalizePoster(movie.Poster)
    }))
  });
});
