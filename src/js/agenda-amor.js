const LOVE_AGENDA_STORAGE_KEY = 'loveAgendaEvents';
const LOVE_AGENDA_COLORS = [
  { name: 'Azul', value: '#5fafd4' },
  { name: 'Rosa', value: '#fe8ce4' },
  { name: 'Verde', value: '#56c985' },
  { name: 'Amarelo', value: '#f5c542' },
  { name: 'Lilás', value: '#9d8cf0' },
  { name: 'Coral', value: '#ff8f70' }
];

let loveAgendaEvents = [];
let loveAgendaWeekStart = getLoveAgendaWeekStart(new Date());
let activeLoveAgendaEventId = null;

function escapeAgendaHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function loveAgendaDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLoveAgendaWeekStart(date) {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function parseLoveAgendaDate(dateValue) {
  return new Date(`${dateValue}T12:00:00`);
}

function formatLoveAgendaDate(dateValue, options) {
  const date = typeof dateValue === 'string' ? parseLoveAgendaDate(dateValue) : dateValue;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', options);
}

function normalizeLoveAgendaTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

function createLoveAgendaId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `agenda-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function setLoveAgendaStatus(message) {
  const status = document.getElementById('loveAgendaStatus');
  if (status) status.textContent = message || '';
}

function mapSupabaseAgendaEvent(event) {
  return {
    id: event.id,
    date: event.event_date,
    title: event.title || '',
    description: event.description || '',
    startTime: normalizeLoveAgendaTime(event.start_time),
    endTime: normalizeLoveAgendaTime(event.end_time),
    color: event.color || LOVE_AGENDA_COLORS[0].value
  };
}

function saveLoveAgendaLocal() {
  localStorage.setItem(LOVE_AGENDA_STORAGE_KEY, JSON.stringify(loveAgendaEvents));
}

async function loadLoveAgendaEvents() {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data, error } = await window.loveSupabase.client
        .from('love_agenda_events')
        .select('id, event_date, title, description, start_time, end_time, color, created_at')
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      loveAgendaEvents = (data || []).map(mapSupabaseAgendaEvent);
      renderLoveAgendaWeek();
      return;
    } catch (error) {
      console.warn('Supabase indisponivel para agenda, usando localStorage.', error);
      setLoveAgendaStatus('Agenda salva neste aparelho enquanto o Supabase não responde.');
    }
  }

  try {
    loveAgendaEvents = JSON.parse(localStorage.getItem(LOVE_AGENDA_STORAGE_KEY) || '[]');
  } catch (error) {
    loveAgendaEvents = [];
  }
  renderLoveAgendaWeek();
}

function loveAgendaEventsForDay(dateKey) {
  return loveAgendaEvents
    .filter(event => event.date === dateKey)
    .sort((a, b) => `${a.startTime || ''}`.localeCompare(`${b.startTime || ''}`));
}

function renderLoveAgendaColors(selectedColor) {
  const grid = document.getElementById('agendaColorGrid');
  if (!grid) return;
  grid.innerHTML = LOVE_AGENDA_COLORS.map((color, index) => `
    <label class="love-agenda-color-option" title="${color.name}">
      <input type="radio" name="agendaEventColor" value="${color.value}" ${color.value === selectedColor || (!selectedColor && index === 0) ? 'checked' : ''}>
      <span style="--agenda-color: ${color.value}"></span>
      <small>${color.name}</small>
    </label>
  `).join('');
}

function renderLoveAgendaWeek() {
  const week = document.getElementById('loveAgendaWeek');
  const title = document.getElementById('agendaWeekTitle');
  const range = document.getElementById('agendaWeekRange');
  if (!week || !title || !range) return;

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(loveAgendaWeekStart);
    date.setDate(loveAgendaWeekStart.getDate() + index);
    return date;
  });

  const firstDay = days[0];
  const lastDay = days[6];
  title.textContent = 'Semana';
  range.textContent = `${formatLoveAgendaDate(firstDay, { day: '2-digit', month: 'short' })} - ${formatLoveAgendaDate(lastDay, { day: '2-digit', month: 'short', year: 'numeric' })}`;

  const todayKey = loveAgendaDateKey(new Date());
  week.innerHTML = days.map(day => {
    const dateKey = loveAgendaDateKey(day);
    const dayEvents = loveAgendaEventsForDay(dateKey);
    const isToday = dateKey === todayKey;
    const eventsHtml = dayEvents.length
      ? dayEvents.map(event => `
          <button class="love-agenda-event" type="button" style="--event-color: ${escapeAgendaHtml(event.color)}" onclick="openLoveAgendaEvent('${event.id}', event)">
            <span>${escapeAgendaHtml(event.startTime)} - ${escapeAgendaHtml(event.endTime)}</span>
            <strong>${escapeAgendaHtml(event.title || 'Compromisso do nosso amor')}</strong>
            ${event.description ? `<small>${escapeAgendaHtml(event.description)}</small>` : ''}
          </button>
        `).join('')
      : '<p class="love-agenda-empty-day">Toque para marcar algo.</p>';

    return `
      <article class="love-agenda-day ${isToday ? 'is-today' : ''}" onclick="openLoveAgendaDay('${dateKey}')">
        <div class="love-agenda-day-head">
          <span>${formatLoveAgendaDate(day, { weekday: 'short' })}</span>
          <strong>${day.getDate()}</strong>
        </div>
        <div class="love-agenda-day-events">${eventsHtml}</div>
      </article>
    `;
  }).join('');
}

function moveLoveAgendaWeek(direction) {
  loveAgendaWeekStart.setDate(loveAgendaWeekStart.getDate() + direction * 7);
  renderLoveAgendaWeek();
}

function goLoveAgendaToday() {
  loveAgendaWeekStart = getLoveAgendaWeekStart(new Date());
  renderLoveAgendaWeek();
}

function openLoveAgendaDay(dateKey) {
  activeLoveAgendaEventId = null;
  document.getElementById('loveAgendaModalTitle').textContent = 'Novo compromisso';
  document.getElementById('agendaEventId').value = '';
  document.getElementById('agendaEventDate').value = dateKey;
  document.getElementById('agendaEventTitle').value = '';
  document.getElementById('agendaEventDescription').value = '';
  document.getElementById('agendaEventStart').value = '09:00';
  document.getElementById('agendaEventEnd').value = '10:00';
  document.getElementById('agendaDeleteButton').hidden = true;
  renderLoveAgendaColors(LOVE_AGENDA_COLORS[0].value);
  openLoveAgendaModal();
}

function openLoveAgendaEvent(id, event) {
  if (event) event.stopPropagation();
  const agendaEvent = loveAgendaEvents.find(item => item.id === id);
  if (!agendaEvent) return;

  activeLoveAgendaEventId = id;
  document.getElementById('loveAgendaModalTitle').textContent = 'Editar compromisso';
  document.getElementById('agendaEventId').value = agendaEvent.id;
  document.getElementById('agendaEventDate').value = agendaEvent.date;
  document.getElementById('agendaEventTitle').value = agendaEvent.title || '';
  document.getElementById('agendaEventDescription').value = agendaEvent.description || '';
  document.getElementById('agendaEventStart').value = agendaEvent.startTime || '09:00';
  document.getElementById('agendaEventEnd').value = agendaEvent.endTime || '10:00';
  document.getElementById('agendaDeleteButton').hidden = false;
  renderLoveAgendaColors(agendaEvent.color);
  openLoveAgendaModal();
}

function openLoveAgendaModal() {
  const modal = document.getElementById('loveAgendaModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeLoveAgendaModal() {
  const modal = document.getElementById('loveAgendaModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function readLoveAgendaForm() {
  const checkedColor = document.querySelector('input[name="agendaEventColor"]:checked');
  return {
    id: document.getElementById('agendaEventId').value || createLoveAgendaId(),
    date: document.getElementById('agendaEventDate').value,
    title: document.getElementById('agendaEventTitle').value.trim(),
    description: document.getElementById('agendaEventDescription').value.trim(),
    startTime: document.getElementById('agendaEventStart').value,
    endTime: document.getElementById('agendaEventEnd').value,
    color: checkedColor ? checkedColor.value : LOVE_AGENDA_COLORS[0].value
  };
}

async function saveLoveAgendaEvent(formEvent) {
  formEvent.preventDefault();
  const agendaEvent = readLoveAgendaForm();

  if (!agendaEvent.date || !agendaEvent.startTime || !agendaEvent.endTime) {
    alert('Escolha o dia, hora de começo e hora de fim.');
    return;
  }

  if (agendaEvent.startTime >= agendaEvent.endTime) {
    alert('A hora de fim precisa ser depois da hora de começo.');
    return;
  }

  const isEditing = Boolean(activeLoveAgendaEventId);
  setLoveAgendaStatus('Salvando compromisso...');

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const payload = {
        event_date: agendaEvent.date,
        title: agendaEvent.title || null,
        description: agendaEvent.description || null,
        start_time: agendaEvent.startTime,
        end_time: agendaEvent.endTime,
        color: agendaEvent.color
      };

      if (isEditing) {
        const { error } = await window.loveSupabase.client
          .from('love_agenda_events')
          .update(payload)
          .eq('id', activeLoveAgendaEventId);
        if (error) throw error;
      } else {
        const { error } = await window.loveSupabase.client
          .from('love_agenda_events')
          .insert(payload);
        if (error) throw error;
      }

      await loadLoveAgendaEvents();
      closeLoveAgendaModal();
      setLoveAgendaStatus('');
      return;
    } catch (error) {
      console.warn('Erro ao salvar agenda no Supabase.', error);
      setLoveAgendaStatus('Não consegui salvar no Supabase agora. Guardando neste aparelho.');
    }
  }

  if (isEditing) {
    loveAgendaEvents = loveAgendaEvents.map(item => item.id === activeLoveAgendaEventId ? agendaEvent : item);
  } else {
    loveAgendaEvents.push(agendaEvent);
  }
  saveLoveAgendaLocal();
  renderLoveAgendaWeek();
  closeLoveAgendaModal();
}

async function deleteLoveAgendaActiveEvent() {
  if (!activeLoveAgendaEventId) return;
  if (!confirm('Excluir esse compromisso?')) return;

  setLoveAgendaStatus('Excluindo compromisso...');

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { error } = await window.loveSupabase.client
        .from('love_agenda_events')
        .delete()
        .eq('id', activeLoveAgendaEventId);

      if (error) throw error;
      await loadLoveAgendaEvents();
      closeLoveAgendaModal();
      setLoveAgendaStatus('');
      return;
    } catch (error) {
      console.warn('Erro ao excluir agenda no Supabase.', error);
      setLoveAgendaStatus('Não consegui excluir no Supabase agora. Removendo deste aparelho.');
    }
  }

  loveAgendaEvents = loveAgendaEvents.filter(item => item.id !== activeLoveAgendaEventId);
  saveLoveAgendaLocal();
  renderLoveAgendaWeek();
  closeLoveAgendaModal();
}

document.addEventListener('DOMContentLoaded', () => {
  renderLoveAgendaColors(LOVE_AGENDA_COLORS[0].value);
  loadLoveAgendaEvents();
});
