// ---- STATE ----
// Data fixa: 10/03/2024 às 00:00
const startDate = new Date('2024-03-10T00:00:15');
let coupleName = 'Legué e Leozinho';
let memories = [];
let pendingPhotos = [];
let currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Mês atual

// ---- LOAD ----
// Carrega apenas memórias e nome do casal (se houver)
function loadState() {
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
    'Desde ' + startDate.toLocaleDateString('pt-BR', opts);
}

setInterval(updateTimer, 1000);

// ---- PHOTOS ----
function previewPhotos(input) {
  pendingPhotos = [];
  const container = document.getElementById('previewImgs');
  container.innerHTML = '';
  const files = Array.from(input.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      pendingPhotos.push(e.target.result);
      const img = document.createElement('img');
      img.src = e.target.result;
      container.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// ---- ADD MEMORY ----
function addMemory() {
  const date = document.getElementById('memDate').value;
  const note = document.getElementById('memNote').value.trim();
  if (!date && !note && pendingPhotos.length === 0) {
    alert('Preencha a data, a nota ou adicione fotos!');
    return;
  }
  const memory = {
    id: Date.now(),
    date: date || new Date().toISOString().slice(0, 10),
    note: note,
    photos: [...pendingPhotos]
  };
  memories.unshift(memory);
  saveState();
  renderMemories();
  renderCalendar();
  // Reset
  document.getElementById('memDate').value = '';
  document.getElementById('memNote').value = '';
  document.getElementById('memPhotos').value = '';
  document.getElementById('previewImgs').innerHTML = '';
  pendingPhotos = [];
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
    const photos = m.photos || [];
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

    return `<div class="memory-card">
      ${photosHtml}
      <div class="memory-info">
        <div class="memory-date">${dateStr}</div>
        ${m.note ? `<div class="memory-note">${m.note}</div>` : ''}
        <div class="memory-actions">
          <button class="btn-del" onclick="deleteMemory(${m.id})">Excluir</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function deleteMemory(id) {
  if (!confirm('Excluir essa memória?')) return;
  memories = memories.filter(m => m.id !== id);
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
      dayDiv.innerHTML += `<div class="calendar-day-indicator">📷</div>`;
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
      // Se tem fotos
      if (mem.photos && mem.photos.length > 0) {
        contentHtml += '<div class="day-modal-photos-grid">';
        mem.photos.forEach(photo => {
          contentHtml += `<img src="${photo}" alt="Memória" onclick="openLightbox('${photo}')" style="cursor:pointer;">`;
        });
        contentHtml += '</div>';
      }
      
      // Se tem apenas nota (sem fotos)
      if (mem.note && (!mem.photos || mem.photos.length === 0)) {
        contentHtml += `<div class="day-modal-text-card">
          <div class="day-modal-text-note">${mem.note}</div>
        </div>`;
      }
      
      // Se tem fotos E nota, mostrar a nota também
      if (mem.note && mem.photos && mem.photos.length > 0) {
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
