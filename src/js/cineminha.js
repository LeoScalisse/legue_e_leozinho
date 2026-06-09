const MOVIES_STORAGE_KEY = 'cineminhaMovies';

let cineminhaMovies = [];

function getMovieSearchApiUrl() {
  return window.loveSupabase && window.loveSupabase.edgeFunctionUrl('movie-search');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizePoster(poster) {
  return poster && poster !== 'N/A' ? poster : '';
}

function mapSupabaseMovie(movie) {
  const ratings = movie.movie_ratings || [];
  const legueRating = ratings.find(rating => rating.person_slug === 'legue');
  const leozinhoRating = ratings.find(rating => rating.person_slug === 'leozinho');

  return {
    id: movie.id,
    apiId: movie.api_id || '',
    imdbID: movie.imdb_id || '',
    title: movie.title,
    year: movie.release_year || '',
    poster: movie.poster_url || '',
    genre: movie.genre || '',
    runtime: movie.runtime || '',
    plot: movie.plot || '',
    legueRating: legueRating && legueRating.rating !== null ? legueRating.rating : '',
    leozinhoRating: leozinhoRating && leozinhoRating.rating !== null ? leozinhoRating.rating : '',
    watchedAt: movie.watched_at || ''
  };
}

async function loadCineminhaState() {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data, error } = await window.loveSupabase.client
        .from('movies')
        .select('id, api_id, imdb_id, title, release_year, poster_url, genre, runtime, plot, watched_at, created_at, movie_ratings(person_slug, rating)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      cineminhaMovies = (data || []).map(mapSupabaseMovie);
      renderMovieGrid();
      return;
    } catch (error) {
      console.warn('Supabase indisponivel para filmes, usando localStorage.', error);
    }
  }

  try {
    const savedMovies = localStorage.getItem(MOVIES_STORAGE_KEY);
    cineminhaMovies = savedMovies ? JSON.parse(savedMovies) : [];
  } catch (error) {
    cineminhaMovies = [];
  }
  renderMovieGrid();
}

function saveCineminhaMovies() {
  localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(cineminhaMovies));
}

async function saveMovieToSupabase(movie) {
  const { data, error } = await window.loveSupabase.client
    .from('movies')
    .insert({
      api_id: movie.apiId || null,
      imdb_id: movie.imdbID || null,
      title: movie.title,
      release_year: movie.year || null,
      poster_url: movie.poster || null,
      genre: movie.genre || null,
      runtime: movie.runtime || null,
      plot: movie.plot || null,
      watched_at: movie.watchedAt || null
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function persistNewMovie(movie) {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const movieId = await saveMovieToSupabase(movie);
    await loadCineminhaState();
    return movieId;
  }

  cineminhaMovies.unshift(movie);
  saveCineminhaMovies();
  renderMovieGrid();
  return movie.id;
}

function setMovieSearchStatus(message) {
  document.getElementById('movieSearchStatus').textContent = message || '';
}

async function searchMovies() {
  const movieSearchApiUrl = getMovieSearchApiUrl();
  const query = document.getElementById('movieSearchInput').value.trim();
  const year = document.getElementById('movieYearInput').value.trim();

  if (!movieSearchApiUrl) {
    setMovieSearchStatus('Configure o Supabase para usar a busca por API. Use o cadastro manual por enquanto.');
    return;
  }

  if (!query) {
    setMovieSearchStatus('Digite o título do filme.');
    return;
  }

  setMovieSearchStatus('Buscando filmes...');
  document.getElementById('movieSearchResults').innerHTML = '';

  const params = new URLSearchParams({ q: query });
  if (year) params.set('y', year);

  try {
    const response = await fetch(`${movieSearchApiUrl}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      setMovieSearchStatus(data.error || 'Nenhum filme encontrado.');
      return;
    }

    setMovieSearchStatus('Escolha um resultado para adicionar.');
    renderMovieSearchResults(data.results || []);
  } catch (error) {
    setMovieSearchStatus('Não consegui acessar a busca agora. Tente de novo ou use o cadastro manual.');
  }
}

function renderMovieSearchResults(results) {
  const container = document.getElementById('movieSearchResults');
  container.innerHTML = results.map(movie => {
    const poster = normalizePoster(movie.poster);
    return `<article class="movie-result-card">
      <div class="movie-result-poster">
        ${poster ? `<img src="${escapeHtml(poster)}" alt="Cartaz de ${escapeHtml(movie.title)}">` : '<span>Sem cartaz</span>'}
      </div>
      <div class="movie-result-info">
        <h3>${escapeHtml(movie.title)}</h3>
        <p>${escapeHtml(movie.year)}</p>
        <button type="button" onclick="addMovieFromApi('${escapeHtml(movie.id)}')">Adicionar</button>
      </div>
    </article>`;
  }).join('');
}

async function addMovieFromApi(movieId) {
  const movieSearchApiUrl = getMovieSearchApiUrl();
  if (!movieSearchApiUrl) {
    setMovieSearchStatus('Configure o Supabase para usar a busca por API.');
    return;
  }

  if (cineminhaMovies.some(movie => movie.apiId === movieId)) {
    setMovieSearchStatus('Esse filme já está no cineminha.');
    return;
  }

  setMovieSearchStatus('Adicionando filme...');
  const params = new URLSearchParams({ id: movieId });

  try {
    const response = await fetch(`${movieSearchApiUrl}?${params.toString()}`);
    const movie = await response.json();

    if (!response.ok || movie.error) {
      setMovieSearchStatus(movie.error || 'Não consegui carregar os detalhes.');
      return;
    }

    const movieRecord = {
      id: Date.now(),
      apiId: movie.id || movieId,
      imdbID: movie.imdbID || '',
      title: movie.title,
      year: movie.year,
      poster: normalizePoster(movie.poster),
      genre: movie.genre || '',
      runtime: movie.runtime || '',
      plot: movie.plot || '',
      legueRating: '',
      leozinhoRating: '',
      watchedAt: new Date().toISOString().slice(0, 10)
    };

    await persistNewMovie(movieRecord);
    setMovieSearchStatus('Filme adicionado ao cineminha.');
  } catch (error) {
    setMovieSearchStatus('Não consegui adicionar pela busca agora. Tente de novo ou use o cadastro manual.');
  }
}

async function addManualMovie() {
  const title = document.getElementById('manualTitleInput').value.trim();
  const year = document.getElementById('manualYearInput').value.trim();
  const poster = document.getElementById('manualPosterInput').value.trim();

  if (!title) {
    alert('Coloque pelo menos o título do filme.');
    return;
  }

  const movieRecord = {
    id: Date.now(),
    apiId: '',
    imdbID: '',
    title,
    year,
    poster,
    genre: '',
    runtime: '',
    plot: '',
    legueRating: '',
    leozinhoRating: '',
    watchedAt: new Date().toISOString().slice(0, 10)
  };

  try {
    await persistNewMovie(movieRecord);
  } catch (error) {
    alert('Nao consegui salvar no Supabase agora. O filme sera salvo localmente neste navegador.');
    cineminhaMovies.unshift(movieRecord);
    saveCineminhaMovies();
    renderMovieGrid();
  }

  document.getElementById('manualTitleInput').value = '';
  document.getElementById('manualYearInput').value = '';
  document.getElementById('manualPosterInput').value = '';
}

async function updateMovieRating(id, field, value) {
  const personSlug = field === 'legueRating' ? 'legue' : 'leozinho';
  cineminhaMovies = cineminhaMovies.map(movie => (
    String(movie.id) === String(id) ? { ...movie, [field]: value } : movie
  ));

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const rating = value === '' ? null : Number(value);
    const { error } = await window.loveSupabase.client
      .from('movie_ratings')
      .upsert({
        movie_id: id,
        person_slug: personSlug,
        rating,
        updated_at: new Date().toISOString()
      }, { onConflict: 'movie_id,person_slug' });

    if (error) {
      alert('Nao consegui salvar essa nota no Supabase agora.');
      console.warn('Erro ao salvar nota no Supabase.', error);
    }
    return;
  }

  saveCineminhaMovies();
}

async function updateWatchedDate(id, value) {
  cineminhaMovies = cineminhaMovies.map(movie => (
    String(movie.id) === String(id) ? { ...movie, watchedAt: value } : movie
  ));

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const { error } = await window.loveSupabase.client
      .from('movies')
      .update({ watched_at: value || null })
      .eq('id', id);

    if (error) {
      alert('Nao consegui salvar a data no Supabase agora.');
      console.warn('Erro ao salvar data do filme no Supabase.', error);
    }
    return;
  }

  saveCineminhaMovies();
}

async function deleteMovie(id) {
  if (!confirm('Remover esse filme do cineminha?')) return;

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const { error } = await window.loveSupabase.client
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Nao consegui excluir esse filme no Supabase agora.');
      console.warn('Erro ao excluir filme no Supabase.', error);
      return;
    }

    await loadCineminhaState();
    return;
  }

  cineminhaMovies = cineminhaMovies.filter(movie => String(movie.id) !== String(id));
  saveCineminhaMovies();
  renderMovieGrid();
}

function renderMovieGrid() {
  const grid = document.getElementById('movieGrid');
  const count = document.getElementById('movieCount');
  const total = cineminhaMovies.length;

  count.textContent = `${total} ${total === 1 ? 'filme salvo' : 'filmes salvos'}`;

  if (total === 0) {
    grid.innerHTML = `<div class="empty-state movie-empty-state">
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 16h36v28H10z" fill="#b8ddf0" opacity="0.7"/>
        <path d="M14 12l4 8m8-8l4 8m8-8l4 8M10 22h36" stroke="#5fafd4" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>Nenhum filme salvo ainda.<br>Procure o primeiro título do cineminha.</p>
    </div>`;
    return;
  }

  grid.innerHTML = cineminhaMovies.map(movie => {
    const poster = normalizePoster(movie.poster);
    return `<article class="movie-card">
      <div class="movie-card-poster">
        ${poster ? `<img src="${escapeHtml(poster)}" alt="Cartaz de ${escapeHtml(movie.title)}">` : '<span>Sem cartaz</span>'}
      </div>
      <div class="movie-card-info">
        <div class="movie-card-heading">
          <h3>${escapeHtml(movie.title)}</h3>
          ${movie.year ? `<span>${escapeHtml(movie.year)}</span>` : ''}
        </div>
        ${movie.genre || movie.runtime ? `<p class="movie-card-meta">${escapeHtml([movie.genre, movie.runtime].filter(Boolean).join(' - '))}</p>` : ''}
        ${movie.plot ? `<p class="movie-card-plot">${escapeHtml(movie.plot)}</p>` : ''}
        <div class="movie-ratings">
          <label>
            Legué
            <input type="number" min="0" max="10" step="0.5" value="${escapeHtml(movie.legueRating)}" onchange="updateMovieRating('${escapeHtml(movie.id)}', 'legueRating', this.value)">
          </label>
          <label>
            Leozinho
            <input type="number" min="0" max="10" step="0.5" value="${escapeHtml(movie.leozinhoRating)}" onchange="updateMovieRating('${escapeHtml(movie.id)}', 'leozinhoRating', this.value)">
          </label>
        </div>
        <label class="movie-watched-date">
          Assistido em
          <input type="date" value="${escapeHtml(movie.watchedAt)}" onchange="updateWatchedDate('${escapeHtml(movie.id)}', this.value)">
        </label>
        <button type="button" class="btn-del movie-delete" onclick="deleteMovie('${escapeHtml(movie.id)}')">Excluir</button>
      </div>
    </article>`;
  }).join('');
}

function clearMovieSearch() {
  document.getElementById('movieSearchInput').value = '';
  document.getElementById('movieYearInput').value = '';
  document.getElementById('movieSearchResults').innerHTML = '';
  setMovieSearchStatus('');
}

function createCineminhaHearts() {
  const bg = document.getElementById('heartsBg');
  const count = 18;
  for (let i = 0; i < count; i++) {
    const div = document.createElement('div');
    div.className = 'heart-float';
    const size = 18 + Math.random() * 28;
    const left = Math.random() * 100;
    const duration = 12 + Math.random() * 16;
    const delay = Math.random() * 14;
    div.style.cssText = `left:${left}%;animation-duration:${duration}s;animation-delay:${delay}s;`;
    div.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21C12 21 3 15 3 9C3 6.2 5.2 4 8 4C9.6 4 11 4.9 12 6.2C13 4.9 14.4 4 16 4C18.8 4 21 6.2 21 9C21 15 12 21 12 21Z" fill="#7ec8e3"/>
    </svg>`;
    bg.appendChild(div);
  }
}

createCineminhaHearts();
loadCineminhaState();
