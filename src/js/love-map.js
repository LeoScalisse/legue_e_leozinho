const LOVE_PLACES_STORAGE_KEY = 'loveMapPlaces';
const LOVE_PLACE_SEARCH_CACHE_KEY = 'lovePlaceSearchCache';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

let lovePlaces = [];
let loveMap = null;
let loveMapMarkers = [];
let loveMapPreviewMarker = null;
let activeLovePlaceId = null;
let currentSearchResults = [];
let lastGeocodeAt = 0;

function escapeLoveMapHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatLovePlaceDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('pt-BR');
}

function getLovePlaceCache() {
  try {
    return JSON.parse(localStorage.getItem(LOVE_PLACE_SEARCH_CACHE_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

function setLovePlaceCache(cache) {
  localStorage.setItem(LOVE_PLACE_SEARCH_CACHE_KEY, JSON.stringify(cache));
}

function setLoveMapStatus(message) {
  const status = document.getElementById('placeSearchStatus');
  if (status) status.textContent = message || '';
}

function getPlaceSearchApiUrl() {
  return window.loveSupabase && window.loveSupabase.edgeFunctionUrl('place-search');
}

function mapSupabaseLovePlace(place) {
  return {
    id: place.id,
    name: place.name || '',
    address: place.address || '',
    experience: place.experience || '',
    visitedAt: place.visited_at || '',
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    osmId: place.osm_id || '',
    osmType: place.osm_type || ''
  };
}

async function loadLovePlacesState() {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data, error } = await window.loveSupabase.client
        .from('love_places')
        .select('id, name, address, experience, visited_at, latitude, longitude, osm_id, osm_type, created_at')
        .order('visited_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      lovePlaces = (data || []).map(mapSupabaseLovePlace);
      renderLoveMapPlaces();
      return;
    } catch (error) {
      console.warn('Supabase indisponivel para lugares, usando localStorage.', error);
    }
  }

  try {
    lovePlaces = JSON.parse(localStorage.getItem(LOVE_PLACES_STORAGE_KEY) || '[]');
  } catch (error) {
    lovePlaces = [];
  }
  renderLoveMapPlaces();
}

function saveLovePlacesLocal() {
  localStorage.setItem(LOVE_PLACES_STORAGE_KEY, JSON.stringify(lovePlaces));
}

async function persistLovePlace(place) {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const { error } = await window.loveSupabase.client
      .from('love_places')
      .insert({
        name: place.name,
        address: place.address,
        experience: place.experience,
        visited_at: place.visitedAt || null,
        latitude: place.latitude,
        longitude: place.longitude,
        osm_id: place.osmId || null,
        osm_type: place.osmType || null
      });

    if (!error) {
      await loadLovePlacesState();
      return true;
    }

    alert('Nao consegui salvar no Supabase agora. Vou guardar nesse navegador por enquanto.');
    console.warn('Erro ao salvar lugar no Supabase.', error);
  }

  lovePlaces.unshift(place);
  saveLovePlacesLocal();
  renderLoveMapPlaces();
  return true;
}

async function deleteLovePlace(id) {
  if (!confirm('Remover esse lugar do mapa?')) return;

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const { error } = await window.loveSupabase.client
      .from('love_places')
      .delete()
      .eq('id', id);

    if (!error) {
      closeLovePlaceModal();
      await loadLovePlacesState();
      return;
    }

    alert('Nao consegui excluir no Supabase agora.');
    console.warn('Erro ao excluir lugar no Supabase.', error);
    return;
  }

  lovePlaces = lovePlaces.filter(place => String(place.id) !== String(id));
  saveLovePlacesLocal();
  renderLoveMapPlaces();
  closeLovePlaceModal();
}

function createLovePlacePopup(place) {
  const date = place.visitedAt ? `<p class="love-map-popup-date">Fomos em ${escapeLoveMapHtml(formatLovePlaceDate(place.visitedAt))}</p>` : '';
  return `<article class="love-map-popup-card">
    <h3>${escapeLoveMapHtml(place.name)}</h3>
    ${date}
    <p>${escapeLoveMapHtml(place.experience)}</p>
    <small>${escapeLoveMapHtml(place.address)}</small>
    <button type="button" onclick="openLovePlaceModal('${escapeLoveMapHtml(place.id)}')">Editar memória</button>
  </article>`;
}

function clearLoveMapMarkers() {
  loveMapMarkers.forEach(marker => marker.remove());
  loveMapMarkers = [];
}

function focusLovePlace(id) {
  const place = lovePlaces.find(item => String(item.id) === String(id));
  if (!place || !loveMap) return;
  loveMap.flyTo({ center: [place.longitude, place.latitude], zoom: 13, speed: 0.8 });

  const markerItem = loveMapMarkers.find(item => String(item.placeId) === String(id));
  if (markerItem) markerItem.popup.setLngLat([place.longitude, place.latitude]).addTo(loveMap);
}

function openLovePlaceModal(id) {
  const place = lovePlaces.find(item => String(item.id) === String(id));
  if (!place) return;

  activeLovePlaceId = String(place.id);
  document.getElementById('editPlaceName').value = place.name || '';
  document.getElementById('editPlaceAddress').value = place.address || '';
  document.getElementById('editPlaceVisitedAt').value = place.visitedAt || '';
  document.getElementById('editPlaceExperience').value = place.experience || '';

  const modal = document.getElementById('lovePlaceModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeLovePlaceModal() {
  const modal = document.getElementById('lovePlaceModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  activeLovePlaceId = null;
}

function focusActiveLovePlaceOnMap() {
  if (!activeLovePlaceId) return;
  const id = activeLovePlaceId;
  closeLovePlaceModal();
  focusLovePlace(id);
}

async function updateLovePlace(id, changes) {
  lovePlaces = lovePlaces.map(place => (
    String(place.id) === String(id) ? { ...place, ...changes } : place
  ));

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const { error } = await window.loveSupabase.client
      .from('love_places')
      .update({
        name: changes.name,
        address: changes.address,
        experience: changes.experience,
        visited_at: changes.visitedAt || null
      })
      .eq('id', id);

    if (error) {
      alert('Nao consegui salvar as alteracoes no Supabase agora.');
      console.warn('Erro ao editar lugar no Supabase.', error);
      return false;
    }

    await loadLovePlacesState();
    return true;
  }

  saveLovePlacesLocal();
  renderLoveMapPlaces();
  return true;
}

async function saveLovePlaceEdit(event) {
  event.preventDefault();
  if (!activeLovePlaceId) return;

  const changes = {
    name: document.getElementById('editPlaceName').value.trim(),
    address: document.getElementById('editPlaceAddress').value.trim(),
    visitedAt: document.getElementById('editPlaceVisitedAt').value,
    experience: document.getElementById('editPlaceExperience').value.trim()
  };

  const saved = await updateLovePlace(activeLovePlaceId, changes);
  if (saved) closeLovePlaceModal();
}

async function deleteActiveLovePlace() {
  if (!activeLovePlaceId) return;
  await deleteLovePlace(activeLovePlaceId);
}

function renderLoveMapPlaces() {
  const count = document.getElementById('lovePlacesCount');
  const grid = document.getElementById('lovePlacesGrid');
  if (count) {
    const total = lovePlaces.length;
    count.textContent = `${total} ${total === 1 ? 'lugar salvo' : 'lugares salvos'} no mapa`;
  }

  clearLoveMapMarkers();

  if (loveMap) {
    lovePlaces.forEach(place => {
      if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return;

      const markerElement = document.createElement('button');
      markerElement.className = 'love-map-marker';
      markerElement.type = 'button';
      markerElement.setAttribute('aria-label', `Abrir memÃ³ria de ${place.name}`);
      markerElement.innerHTML = '<span></span>';

      const popup = new maplibregl.Popup({ offset: 18, closeButton: true, maxWidth: '280px' })
        .setHTML(createLovePlacePopup(place));

      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(loveMap);

      loveMapMarkers.push({ placeId: place.id, marker, popup });
    });

    if (lovePlaces.length) fitLoveMapToPlaces();
  }

  if (!grid) return;

  if (!lovePlaces.length) {
    grid.innerHTML = `<div class="empty-state movie-empty-state">
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 8C18 8 10 16 10 26c0 12 18 24 18 24s18-12 18-24C46 16 38 8 28 8Z" fill="#b8ddf0" opacity="0.7"/>
        <circle cx="28" cy="26" r="6" stroke="#5fafd4" stroke-width="2"/>
      </svg>
      <p>Nenhum lugar salvo ainda.<br>Pesquise o primeiro cantinho de vocÃªs.</p>
    </div>`;
    return;
  }

  grid.innerHTML = lovePlaces.map(place => `
    <article class="love-place-card love-place-name-card" onclick="openLovePlaceModal('${escapeLoveMapHtml(place.id)}')" tabindex="0" role="button" aria-label="Editar ${escapeLoveMapHtml(place.name)}" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLovePlaceModal('${escapeLoveMapHtml(place.id)}'); }">
      <h3>${escapeLoveMapHtml(place.name)}</h3>
    </article>
  `).join('');
}

function fitLoveMapToPlaces() {
  if (!loveMap || !lovePlaces.length) return;
  const bounds = new maplibregl.LngLatBounds();
  const validPlaces = [];
  let hasPlaces = false;

  lovePlaces.forEach(place => {
    if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return;
    bounds.extend([place.longitude, place.latitude]);
    validPlaces.push(place);
    hasPlaces = true;
  });

  if (!hasPlaces) return;
  if (validPlaces.length === 1) {
    loveMap.flyTo({ center: [validPlaces[0].longitude, validPlaces[0].latitude], zoom: 10 });
    return;
  }

  loveMap.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 700 });
}

function renderPlaceSearchResults(results) {
  const container = document.getElementById('placeSearchResults');
  if (!container) return;

  if (!results.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = results.map((result, index) => `
    <button class="love-place-result" type="button" onclick="selectLovePlaceResult(${index})">
      <strong>${escapeLoveMapHtml(result.name || result.display_name)}</strong>
      <span>${escapeLoveMapHtml(result.display_name)}</span>
    </button>
  `).join('');
}

async function fetchLovePlaceResults(query, useEdgeFunction = true) {
  const placeSearchApiUrl = useEdgeFunction ? getPlaceSearchApiUrl() : '';
  const params = placeSearchApiUrl
    ? new URLSearchParams({ q: query })
    : new URLSearchParams({
      format: 'jsonv2',
      q: query,
      limit: '5',
      addressdetails: '1',
      dedupe: '1',
      'accept-language': 'pt-BR'
    });

  const response = await fetch(`${placeSearchApiUrl || NOMINATIM_SEARCH_URL}?${params.toString()}`, {
    headers: placeSearchApiUrl ? window.loveSupabase.edgeFunctionHeaders() : {}
  });

  if (!response.ok) throw new Error('Place search failed.');

  const data = await response.json();
  const results = placeSearchApiUrl ? data.results : data;
  return Array.isArray(results) ? results : [];
}

async function searchLovePlace() {
  const input = document.getElementById('placeSearchInput');
  const query = input ? input.value.trim() : '';

  if (!query) {
    setLoveMapStatus('Digite um endereÃ§o ou nome de lugar.');
    return;
  }

  const normalizedQuery = query.toLowerCase();
  const cache = getLovePlaceCache();

  if (cache[normalizedQuery]) {
    currentSearchResults = cache[normalizedQuery];
    renderPlaceSearchResults(currentSearchResults);
    setLoveMapStatus('Escolha um resultado para preencher o ponto no mapa.');
    return;
  }

  const waitMs = Math.max(0, 1100 - (Date.now() - lastGeocodeAt));
  if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));
  lastGeocodeAt = Date.now();

  setLoveMapStatus('Buscando lugar...');
  renderPlaceSearchResults([]);

  try {
    try {
      currentSearchResults = await fetchLovePlaceResults(query, true);
    } catch (edgeError) {
      currentSearchResults = await fetchLovePlaceResults(query, false);
    }

    cache[normalizedQuery] = currentSearchResults;
    setLovePlaceCache(cache);
    renderPlaceSearchResults(currentSearchResults);
    setLoveMapStatus(currentSearchResults.length ? 'Escolha um resultado para preencher o ponto no mapa.' : 'Nao encontrei esse lugar. Tente escrever com cidade/estado.');
  } catch (error) {
    setLoveMapStatus('Nao consegui buscar esse lugar agora. Tente de novo em instantes.');
  }
}

function selectLovePlaceResult(index) {
  const result = currentSearchResults[index];
  if (!result) return;

  const lat = Number(result.lat);
  const lon = Number(result.lon);
  const name = result.name || result.display_name.split(',')[0] || '';

  document.getElementById('placeLatitude').value = lat;
  document.getElementById('placeLongitude').value = lon;
  document.getElementById('placeName').value = name;
  document.getElementById('placeAddress').value = result.display_name || '';

  setLoveMapStatus('');

  if (!loveMap || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

  if (loveMapPreviewMarker) loveMapPreviewMarker.remove();
  const markerElement = document.createElement('div');
  markerElement.className = 'love-map-marker love-map-preview-marker';
  markerElement.innerHTML = '<span></span>';
  loveMapPreviewMarker = new maplibregl.Marker({ element: markerElement })
    .setLngLat([lon, lat])
    .addTo(loveMap);

  loveMap.flyTo({ center: [lon, lat], zoom: 13, speed: 0.8 });
}

async function saveLovePlace(event) {
  event.preventDefault();

  const latitude = Number(document.getElementById('placeLatitude').value);
  const longitude = Number(document.getElementById('placeLongitude').value);
  const name = document.getElementById('placeName').value.trim();
  const address = document.getElementById('placeAddress').value.trim();
  const visitedAt = document.getElementById('placeVisitedAt').value;
  const experience = document.getElementById('placeExperience').value.trim();
  const selectedResult = currentSearchResults.find(result => Number(result.lat) === latitude && Number(result.lon) === longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    setLoveMapStatus('Escolha um resultado da busca antes de salvar.');
    return;
  }

  const place = {
    id: Date.now(),
    name,
    address,
    experience,
    visitedAt,
    latitude,
    longitude,
    osmId: selectedResult ? String(selectedResult.osm_id || '') : '',
    osmType: selectedResult ? String(selectedResult.osm_type || '') : ''
  };

  await persistLovePlace(place);
  event.target.reset();
  currentSearchResults = [];
  renderPlaceSearchResults([]);
  setLoveMapStatus('Lugar salvo no mapa do nosso amor.');

  if (loveMapPreviewMarker) {
    loveMapPreviewMarker.remove();
    loveMapPreviewMarker = null;
  }
}

function initLoveMap() {
  const mapContainer = document.getElementById('loveMap');
  if (!mapContainer || !window.maplibregl) {
    loadLovePlacesState();
    return;
  }

  loveMap = new maplibregl.Map({
    container: mapContainer,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [-46.6333, -23.5505],
    zoom: 1.7,
    minZoom: 1.2,
    renderWorldCopies: false,
    attributionControl: true
  });

  loveMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  loveMap.on('load', loadLovePlacesState);
}

function createLoveMapHearts() {
  const bg = document.getElementById('heartsBg');
  if (!bg) return;
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

createLoveMapHearts();
initLoveMap();
