// ---- STATE ----
// Data fixa: 10/03/2024 às 00:00
const startDate = new Date('2024-03-10T00:00:15');
let coupleName = 'Legué e Leozinho';
let memories = [];
let pendingPhotos = [];
let pendingPhotoFiles = [];
const MAX_MEMORY_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_MEMORY_VIDEO_BYTES = 50 * 1024 * 1024;
const SUPPORTED_MEMORY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
const SUPPORTED_MEMORY_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
const SUPPORTED_MEMORY_FILE_TYPES = [...SUPPORTED_MEMORY_IMAGE_TYPES, ...SUPPORTED_MEMORY_VIDEO_TYPES];
const SUPPORTED_MEMORY_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
const SUPPORTED_MEMORY_VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v'];
const IPHONE_MEDIA_MIME_ERROR = 'O Supabase ainda nao esta aceitando esse formato de midia. Rode a migracao do bucket e tente de novo.';
let currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Mês atual

// ---- LOAD ----
// Carrega apenas memórias e nome do casal (se houver)
function mapSupabaseMemory(memory) {
  const media = (memory.memory_photos || [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(photo => ({
      url: photo.public_url || window.loveSupabase.getPublicUrl(photo.storage_path),
      type: photo.media_type || 'image'
    }))
    .filter(item => item.url);

  return {
    id: memory.id,
    date: memory.memory_date,
    note: memory.note || '',
    media,
    photos: media.filter(item => item.type === 'image').map(item => item.url)
  };
}

async function loadState() {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data, error } = await window.loveSupabase.client
        .from('memories')
        .select('id, memory_date, note, created_at, memory_photos(storage_path, public_url, media_type, display_order)')
        .order('memory_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        const { data: legacyData, error: legacyError } = await window.loveSupabase.client
          .from('memories')
          .select('id, memory_date, note, created_at, memory_photos(storage_path, public_url, display_order)')
          .order('memory_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (legacyError) throw error;
        memories = (legacyData || []).map(mapSupabaseMemory);
        renderMemories();
        renderCalendar();
        return;
      }
      memories = (data || []).map(mapSupabaseMemory);
      renderMemories();
      renderCalendar();
      return;
    } catch (e) {
      console.warn('Supabase indisponivel para memorias, usando localStorage.', e);
    }
  }

  try {
    const cn = localStorage.getItem('loveCoupleName');
    const mem = localStorage.getItem('loveMemories');
    if (cn) coupleName = cn;
    if (mem) memories = JSON.parse(mem);
  } catch(e) {}
  renderMemories();
}

function saveState() {
  try {
    localStorage.setItem('loveCoupleName', coupleName);
    localStorage.setItem('loveMemories', JSON.stringify(memories));
  } catch(e) {}
}

function createMemoryId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function mediaTypeFromMime(mimeType) {
  return mimeType && mimeType.startsWith('video/') ? 'video' : 'image';
}

function fileExtension(file) {
  const name = file && file.name ? file.name : '';
  const parts = name.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function isSupportedMemoryFile(file) {
  const mimeType = (file && file.type ? file.type : '').toLowerCase();
  const extension = fileExtension(file);

  return SUPPORTED_MEMORY_FILE_TYPES.includes(mimeType) ||
    SUPPORTED_MEMORY_IMAGE_EXTENSIONS.includes(extension) ||
    SUPPORTED_MEMORY_VIDEO_EXTENSIONS.includes(extension);
}

function mediaTypeFromFile(file) {
  const mimeType = (file && file.type ? file.type : '').toLowerCase();
  const extension = fileExtension(file);

  if (SUPPORTED_MEMORY_VIDEO_TYPES.includes(mimeType) || SUPPORTED_MEMORY_VIDEO_EXTENSIONS.includes(extension)) {
    return 'video';
  }

  return 'image';
}

function normalizeMemoryMedia(memory) {
  if (Array.isArray(memory.media)) return memory.media;
  return (memory.photos || []).map(photo => (
    typeof photo === 'string' ? { url: photo, type: 'image' } : photo
  )).filter(item => item && item.url);
}

function renderMemoryMediaItem(item, className = 'memory-carousel-media') {
  if (item.type === 'video') {
    return `<video class="${className}" src="${item.url}" controls preload="metadata" playsinline onerror="handleMemoryMediaError(this, 'video')"></video>`;
  }

  return `<img class="${className}" src="${item.url}" alt="Memoria" onclick="openLightbox('${item.url}', 'image')" onerror="handleMemoryMediaError(this, 'image')" style="cursor:pointer">`;
}

function handleMemoryMediaError(element, mediaType) {
  if (!element) return;
  const url = element.currentSrc || element.src || element.getAttribute('src') || '';
  const fallback = document.createElement(url ? 'a' : 'div');
  fallback.className = 'memory-media-fallback';
  fallback.textContent = mediaType === 'video' ? 'Abrir video' : 'Abrir imagem';
  if (url) {
    fallback.href = url;
    fallback.target = '_blank';
    fallback.rel = 'noopener';
  }
  element.replaceWith(fallback);
}

function validateMemoryFiles(files) {
  const invalidFiles = files.filter(file => !isSupportedMemoryFile(file));
  if (invalidFiles.length > 0) {
    return `Alguns arquivos estao em um formato que o site nao consegue exibir/salvar. Use JPG, PNG, WEBP, GIF, HEIC, HEIF, MP4, MOV ou M4V. Arquivo: ${invalidFiles[0].name}`;
  }

  const oversizedImage = files.find(file => mediaTypeFromFile(file) === 'image' && file.size > MAX_MEMORY_IMAGE_BYTES);
  if (oversizedImage) {
    return `A foto "${oversizedImage.name}" tem mais de 10 MB. Diminua a imagem e tente de novo.`;
  }

  const oversizedVideo = files.find(file => mediaTypeFromFile(file) === 'video' && file.size > MAX_MEMORY_VIDEO_BYTES);
  if (oversizedVideo) {
    return `O video "${oversizedVideo.name}" tem mais de 50 MB. Diminua o video e tente de novo.`;
  }

  return '';
}

function memorySaveErrorMessage(error) {
  const code = String(error && (error.code || error.error || error.statusCode) || '').toLowerCase();
  const message = String(error && (error.message || error.error_description || error.statusText) || '').toLowerCase();

  if (code.includes('invalidmimetype') || code.includes('invalid_mime_type') || message.includes('mime type')) {
    return IPHONE_MEDIA_MIME_ERROR;
  }

  return 'Nao consegui salvar essa memoria no Supabase. Nada foi salvo localmente para nao perder a sincronizacao. Tente novamente em instantes.';
}

async function removeUploadedPhotos(paths) {
  if (!window.loveSupabase || !window.loveSupabase.isReady() || paths.length === 0) return;

  try {
    await window.loveSupabase.client.storage
      .from(window.loveSupabase.storageBucket)
      .remove(paths);
  } catch (error) {
    console.warn('Nao consegui limpar fotos enviadas apos erro.', error);
  }
}

async function removeMemoryRow(id) {
  if (!window.loveSupabase || !window.loveSupabase.isReady() || !id) return;

  try {
    await window.loveSupabase.client
      .from('memories')
      .delete()
      .eq('id', id);
  } catch (error) {
    console.warn('Nao consegui limpar memoria apos erro.', error);
  }
}

// ---- TIMER ----
function updateTimer() {
  const now = new Date();
  const diff = now - startDate;
  if (diff < 0) return;

  const totalSecs = Math.floor(diff / 1000);
  const secs = totalSecs % 60;
  const totalMins = Math.floor(totalSecs / 60);
  const mins = totalMins % 60;
  const totalHours = Math.floor(totalMins / 60);
  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);

  // Years, months, days
  const startY = startDate.getFullYear(), startM = startDate.getMonth(), startD = startDate.getDate();
  const nowY = now.getFullYear(), nowM = now.getMonth(), nowD = now.getDate();
  let years = nowY - startY;
  let months = nowM - startM;
  let days = nowD - startD;
  if (days < 0) { months--; const prevMonth = new Date(nowY, nowM, 0); days += prevMonth.getDate(); }
  if (months < 0) { years--; months += 12; }

  const pad = n => String(n).padStart(2, '0');
  document.getElementById('tYears').textContent = years;
  document.getElementById('tMonths').textContent = months;
  document.getElementById('tDays').textContent = days;
  document.getElementById('tHours').textContent = pad(hours);
  document.getElementById('tMins').textContent = pad(mins);
  document.getElementById('tSecs').textContent = pad(secs);

  const opts = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById('startDateInfo').textContent =
    'Desde 10 de março de 2024 às mais ou menos 00:15 (Damn thinelo)';
}

setInterval(updateTimer, 1000);

// ---- PHOTOS ----
function previewPhotos(input) {
  pendingPhotos = [];
  pendingPhotoFiles = Array.from(input.files);
  const container = document.getElementById('previewImgs');
  container.innerHTML = '';
  pendingPhotoFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const media = {
        url: e.target.result,
        type: mediaTypeFromFile(file)
      };
      pendingPhotos.push(media);
      const preview = document.createElement(media.type === 'video' ? 'video' : 'img');
      preview.src = media.url;
      preview.className = 'preview-media';
      preview.onerror = () => handleMemoryMediaError(preview, media.type);
      if (media.type === 'video') {
        preview.controls = true;
        preview.muted = true;
        preview.playsInline = true;
        preview.preload = 'metadata';
      }
      container.appendChild(preview);
    };
    reader.readAsDataURL(file);
  });
}

// ---- ADD MEMORY ----
async function addMemory() {
  const date = document.getElementById('memDate').value;
  const note = document.getElementById('memNote').value.trim();
  if (!date && !note && pendingPhotoFiles.length === 0) {
    alert('Preencha a data, a nota ou adicione fotos!');
    return;
  }

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const validationError = validateMemoryFiles(pendingPhotoFiles);
    if (validationError) {
      alert(validationError);
      return;
    }

    const memoryId = createMemoryId();
    const uploadedPhotos = [];
    let memoryInserted = false;

    try {
      for (let index = 0; index < pendingPhotoFiles.length; index++) {
        const uploaded = await window.loveSupabase.uploadImage(`memories/${memoryId}`, pendingPhotoFiles[index]);
        uploadedPhotos.push({
          memory_id: memoryId,
          storage_path: uploaded.storage_path,
          public_url: uploaded.public_url,
          media_type: mediaTypeFromFile(pendingPhotoFiles[index]),
          display_order: index
        });
      }

      const { data: insertedMemory, error: memoryError } = await window.loveSupabase.client
        .from('memories')
        .insert({
          id: memoryId,
          memory_date: date || new Date().toISOString().slice(0, 10),
          note
        })
        .select('id')
        .single();

      if (memoryError) throw memoryError;
      memoryInserted = Boolean(insertedMemory);

      if (uploadedPhotos.length > 0) {
        let { error: photosError } = await window.loveSupabase.client
          .from('memory_photos')
          .insert(uploadedPhotos);

        if (photosError && uploadedPhotos.every(photo => photo.media_type === 'image')) {
          const legacyPhotos = uploadedPhotos.map(({ media_type, ...photo }) => photo);
          const legacyInsert = await window.loveSupabase.client
            .from('memory_photos')
            .insert(legacyPhotos);
          photosError = legacyInsert.error;
        }

        if (photosError) throw photosError;
      }

      await loadState();
      resetMemoryForm();
      return;
    } catch (e) {
      await removeUploadedPhotos(uploadedPhotos.map(photo => photo.storage_path).filter(Boolean));
      if (memoryInserted) await removeMemoryRow(memoryId);
      alert(memorySaveErrorMessage(e));
      console.warn('Erro ao salvar memoria no Supabase.', e);
      return;
    }
  }

  if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) {
    alert('O Supabase nao carregou agora, entao a memoria nao foi salva. Recarregue a pagina e tente novamente.');
    return;
  }

  const memory = {
    id: Date.now(),
    date: date || new Date().toISOString().slice(0, 10),
    note: note,
    media: [...pendingPhotos],
    photos: pendingPhotos.filter(item => item.type === 'image').map(item => item.url)
  };
  memories.unshift(memory);
  saveState();
  renderMemories();
  renderCalendar();
  resetMemoryForm();
}

function resetMemoryForm() {
  document.getElementById('memDate').value = '';
  document.getElementById('memNote').value = '';
  document.getElementById('memPhotos').value = '';
  document.getElementById('previewImgs').innerHTML = '';
  pendingPhotos = [];
  pendingPhotoFiles = [];
}

// ---- RENDER ----
function renderMemories() {
  const grid = document.getElementById('memoriesGrid');
  if (memories.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 48 C28 48 8 36 8 22 C8 15 13 10 20 10 C23.5 10 27 12 28 15 C29 12 32.5 10 36 10 C43 10 48 15 48 22 C48 36 28 48 28 48Z" fill="#7ec8e3"/>
      </svg>
      <p>Nenhuma memória ainda...<br>Adicione a primeira lembrança de vocês! 💙</p>
    </div>`;
    return;
  }

  grid.innerHTML = memories.map(m => {
    const dateStr = m.date ? new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const media = normalizeMemoryMedia(m);
    let mediaHtml = '';
    const photos = media.map(item => item.url);
    let photosHtml = '';

    if (photos.length === 0) {
      photosHtml = `<div class="memory-photos one" style="display:flex;align-items:center;justify-content:center;min-height:120px;">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 40C24 40 8 30 8 20C8 15 12 11 17 11C19.5 11 22 12.5 24 15C26 12.5 28.5 11 31 11C36 11 40 15 40 20C40 30 24 40 24 40Z" fill="#b8ddf0" opacity="0.6"/></svg>
      </div>`;
    } else if (photos.length === 1) {
      photosHtml = `<div class="memory-photos one" onclick="openLightbox('${photos[0]}')">
        <img src="${photos[0]}" alt="Memória" style="cursor:pointer">
      </div>`;
    } else if (photos.length === 2) {
      photosHtml = `<div class="memory-photos two">
        ${photos.slice(0, 2).map(p => `<img src="${p}" alt="" onclick="openLightbox('${p}')" style="cursor:pointer">`).join('')}
      </div>`;
    } else if (photos.length === 3) {
      photosHtml = `<div class="memory-photos three">
        ${photos.slice(0, 3).map(p => `<img src="${p}" alt="" onclick="openLightbox('${p}')" style="cursor:pointer">`).join('')}
      </div>`;
    } else {
      photosHtml = `<div class="memory-photos many">
        ${photos.slice(0, 3).map(p => `<img src="${p}" alt="" onclick="openLightbox('${p}')" style="cursor:pointer">`).join('')}
        <div class="photo-count-more" style="min-height:90px;cursor:pointer" onclick="openLightbox('${photos[3]}')">+${photos.length - 3}</div>
      </div>`;
    }

    mediaHtml = media.length > 0
      ? `<div class="memory-carousel" aria-label="Carrossel de fotos e videos da memoria">
          <div class="memory-carousel-track">
            ${media.map(item => `<div class="memory-carousel-slide">${renderMemoryMediaItem(item)}</div>`).join('')}
          </div>
          ${media.length > 1 ? `<div class="memory-carousel-count">${media.length} arquivos</div>` : ''}
        </div>`
      : photosHtml;

    return `<div class="memory-card">
      ${mediaHtml}
      <div class="memory-info">
        <div class="memory-date">${dateStr}</div>
        ${m.note ? `<div class="memory-note">${m.note}</div>` : ''}
        <div class="memory-actions">
          <button class="btn-del" onclick="deleteMemory('${m.id}')">Excluir</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function deleteMemory(id) {
  if (!confirm('Excluir essa memória?')) return;

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data: photos, error: photosError } = await window.loveSupabase.client
        .from('memory_photos')
        .select('storage_path')
        .eq('memory_id', id);

      if (photosError) throw photosError;

      const paths = (photos || []).map(photo => photo.storage_path).filter(Boolean);
      if (paths.length > 0) {
        await window.loveSupabase.client.storage
          .from(window.loveSupabase.storageBucket)
          .remove(paths);
      }

      const { error } = await window.loveSupabase.client
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadState();
      return;
    } catch (e) {
      alert('Nao consegui excluir no Supabase agora.');
      console.warn('Erro ao excluir memoria no Supabase.', e);
      return;
    }
  }

  memories = memories.filter(m => String(m.id) !== String(id));
  saveState();
  renderMemories();
  renderCalendar();
}

// ---- CALENDAR ----
function getMemoriesForDate(dateStr) {
  return memories.filter(m => m.date === dateStr);
}

function prevMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  // Atualizar título
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  document.getElementById('calendarTitle').textContent = `${monthNames[month]} ${year}`;
  
  // Primeiro dia do mês
  const firstDay = new Date(year, month, 1).getDay();
  // Último dia do mês
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  const daysContainer = document.getElementById('calendarDays');
  daysContainer.innerHTML = '';
  
  // Dias vazios antes do primeiro dia do mês
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    daysContainer.appendChild(emptyDay);
  }
  
  // Dias do mês
  for (let day = 1; day <= lastDay; day++) {
    const dayDiv = document.createElement('div');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayMemories = getMemoriesForDate(dateStr);
    
    dayDiv.className = 'calendar-day';
    if (dayMemories.length > 0) {
      dayDiv.classList.add('has-memories');
    }
    
    dayDiv.innerHTML = `<div class="calendar-day-number">${day}</div>`;
    
    if (dayMemories.length > 0) {
      dayDiv.innerHTML += `<div class="calendar-day-indicator">💙</div>`;
    }
    
    dayDiv.onclick = () => showDayDetails(dateStr, dayMemories, day, month, year);
    daysContainer.appendChild(dayDiv);
  }
}

function showDayDetails(dateStr, dayMemories, day, month, year) {
  const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const dayOfWeek = new Date(year, month, day).getDay();
  
  document.getElementById('dayModalTitle').textContent = 
    `${dayNames[dayOfWeek]}, ${day} de ${monthNames[month]} de ${year}`;
  
  if (dayMemories.length === 0) {
    document.getElementById('dayModalContent').innerHTML = 
      '<div style="text-align:center; padding:2rem; color:var(--text-soft);">Nenhuma memória neste dia</div>';
  } else {
    let contentHtml = '<div class="day-modal-items">';
    
    dayMemories.forEach(mem => {
      const media = normalizeMemoryMedia(mem);
      // Se tem fotos
      if (false && mem.photos && mem.photos.length > 0) {
        contentHtml += '<div class="day-modal-photos-grid">';
        mem.photos.forEach(photo => {
          contentHtml += `<img src="${photo}" alt="Memória" onclick="openLightbox('${photo}')" style="cursor:pointer;">`;
        });
        contentHtml += '</div>';
      }

      if (media.length > 0) {
        contentHtml += '<div class="day-modal-media-carousel"><div class="memory-carousel-track">';
        media.forEach(item => {
          contentHtml += `<div class="memory-carousel-slide">${renderMemoryMediaItem(item)}</div>`;
        });
        contentHtml += '</div></div>';
      }
      
      // Se tem apenas nota (sem fotos)
      if (mem.note && media.length === 0) {
        contentHtml += `<div class="day-modal-text-card">
          <div class="day-modal-text-note">${mem.note}</div>
        </div>`;
      }
      
      // Se tem fotos E nota, mostrar a nota também
      if (mem.note && media.length > 0) {
        contentHtml += `<div class="day-modal-note-item">💬 ${mem.note}</div>`;
      }
    });
    
    contentHtml += '</div>';
    document.getElementById('dayModalContent').innerHTML = contentHtml;
  }
  
  document.getElementById('dayModal').classList.add('open');
}

function closeDayModal() {
  document.getElementById('dayModal').classList.remove('open');
}

// ---- LIGHTBOX ----
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxImg').src = '';
}

// ---- FLOATING HEARTS ----
function createHearts() {
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

// ---- INIT ----
createHearts();
loadState();
updateTimer();
renderCalendar();

// Set today's date as default in form
document.getElementById('memDate').value = new Date().toISOString().slice(0, 10);
