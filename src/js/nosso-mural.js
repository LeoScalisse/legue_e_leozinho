const LOVE_MURAL_STORAGE_KEY = 'loveMuralItems';
const LOVE_MURAL_CAPTIONS_STORAGE_KEY = 'loveMuralCaptions';
const LOVE_MURAL_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const LOVE_MURAL_TAP_MOVE_THRESHOLD = 28;
const LOVE_MURAL_NODE_DRAG_THRESHOLD = 24;
const LOVE_MURAL_OLD_DEFAULT_ITEMS = [
  { id: 'default-legue-1', src: '../src/assets/profile/legue/legue-1.jpeg', title: 'Legué', description: 'Uma das fotos que já mora no nosso site.', isDefault: true },
  { id: 'default-legue-2', src: '../src/assets/profile/legue/legue-2.jpeg', title: 'Legué', description: 'Um pedacinho dela no mural.', isDefault: true },
  { id: 'default-legue-3', src: '../src/assets/profile/legue/legue-3.jpeg', title: 'Legué', description: 'Mais uma lembrança para girar.', isDefault: true },
  { id: 'default-legue-4', src: '../src/assets/profile/legue/legue-4.jpeg', title: 'Legué', description: 'Foto inicial do mural.', isDefault: true },
  { id: 'default-leozinho-1', src: '../src/assets/profile/leozinho/leozinho-1.jpeg', title: 'Leozinho', description: 'Uma das fotos que já mora no nosso site.', isDefault: true },
  { id: 'default-leozinho-2', src: '../src/assets/profile/leozinho/leozinho-2.jpeg', title: 'Leozinho', description: 'Um pedacinho dele no mural.', isDefault: true },
  { id: 'default-leozinho-3', src: '../src/assets/profile/leozinho/leozinho-3.jpeg', title: 'Leozinho', description: 'Mais uma lembrança para girar.', isDefault: true },
  { id: 'default-leozinho-4', src: '../src/assets/profile/leozinho/leozinho-4.jpeg', title: 'Leozinho', description: 'Foto inicial do mural.', isDefault: true },
  { id: 'default-takoiaki', src: '../src/assets/special-hearts/takoiaki.jpeg', title: 'Takoiaki', description: 'Uma memória especial que também cabe aqui.', isDefault: true },
  { id: 'default-tbt', src: '../src/assets/special-hearts/vem-de-tbt.jpeg', title: 'TBT', description: 'Uma lembrança para não perder.', isDefault: true }
];
const LOVE_MURAL_STATIC_FILES = [
  '008436fb-479f-4dbc-9afd-9aa62e96f445.JPG',
  '0e0e3da9-55af-467d-9ddd-058195d19488.JPG',
  '19e5072f-73eb-41d9-b451-699346d5ea1b.JPG',
  '269ab1e4-9f1b-4082-a017-1d0c035670b6.JPG',
  '28ea7a5b-e285-40f2-a6c8-8265510349fe.JPG',
  '331024e0-ae70-4b43-a5b0-dfe9adb7b9ac.JPG',
  '3d1df58e-3bc2-49f1-99c3-efcc5145bdc0.JPG',
  '3d468a5b-1fa3-46cb-ac4b-349e2a7826f4.JPG',
  '4cfbd232-78d2-44a1-8e55-9e2f8b9b5399.JPG',
  '4e23003f-cd79-484d-a55f-5ec19e83f30f.JPG',
  '51432164-4f81-4731-941d-3216eef80831.JPG',
  '535df314-e981-4f1d-8ebd-229c6a23256e.JPG',
  '53a43a87-6fda-4fc7-b52b-699a8b66fb36.JPG',
  '56C08D6D-1D89-4040-9FB9-AC4FB10547AB.JPG',
  '58577cd1-ac3a-4df5-b541-5a78d73abd2f.JPG',
  '644a7b18-f364-4703-aac7-6b8700aa712f.JPG',
  '647294e5-2e6c-40dc-8e62-d759870d7fe1.JPG',
  '6d9d5a2e-144a-48ef-b0d8-d1675a761feb.JPG',
  '710857ed-c9cc-4218-94e8-6e2694d95b95.JPG',
  '772b5d73-2cb6-474a-bc27-c2f02231f547.JPG',
  '776304d5-14f4-45c1-9d33-3f6a2b372f05.JPG',
  '7b278e72-2059-4aab-9c43-238127192130.JPG',
  '7c137159-4107-4818-a3ed-a63c84056abc.JPG',
  '80b041fd-6ecf-4400-9904-2c621c05b62b.JPG',
  '8230861c-f6d2-4e77-8912-954a18fb3441.JPG',
  '8385d2d6-4927-4883-92bc-c92cee3e42d4.JPG',
  '9bcc9c1e-0236-4b42-9c96-9dbb6e14d681.JPG',
  '9c18349e-db9d-4f18-a7db-09b506a9082b.JPG',
  'a2fea3ca-bf68-446f-8289-c3b1a24b0930.JPG',
  'a8c400c8-b925-44ab-91ae-3d21d172fb09.JPG',
  'ab0f7d0d-e0c0-4eff-ac8e-3791b96cc303.JPG',
  'afcbe9fd-3940-42d6-8f79-bd012135af71.JPG',
  'c0a09ebd-8f60-4b88-9f02-e33c8bba916f.JPG',
  'd6060e8e-29d3-4436-a6bf-68a09ff9daf3.JPG',
  'd8fc0154-7b67-49f8-9d4b-4462cc8ad49f.JPG',
  'd974098f-e586-492a-a121-f33d62f5b746.JPG',
  'dbe7a02f-2bf1-4ccd-9aed-7935dfec5661.JPG',
  'e1561fb0-d14c-4947-a5c1-c3e0303ce7d7.JPG',
  'e390f3ae-3c1e-46f7-abcf-53eb8ff20dd1.JPG',
  'e9bbab05-4b86-4b81-afad-ac58a6157fa2.JPG',
  'ee99a140-7e09-42fc-b7bb-7bc300884380.JPG',
  'f27eef03-00c6-45bd-92ec-aca751b87ed6.JPG',
  'f29d6887-4fae-4820-bba0-5027132b3d1d.JPG',
  'f5bad35f-976b-4d31-ad01-2bcb02777ed4.JPG',
  'f7fd7b82-edc0-43ec-bf61-46b7203e86f2.JPG',
  'f87cfa92-97bf-441a-a2b7-9fa3732980fc.JPG',
  'fd922488-b5bd-414b-8f33-966ed5a8fba5.JPG',
  'IMG_0133.jpg',
  'IMG_1009.JPG',
  'IMG_1040.jpg',
  'IMG_1056.jpg',
  'IMG_3120.jpg',
  'IMG_4107.jpg',
  'IMG_6520.jpg',
  'IMG_7805.jpg',
  'IMG_7932.jpg',
  'IMG_8817.jpg',
  'IMG_8821.jpg',
  'photo-2363_singular_display_fullPicture.jpg'
];
const LOVE_MURAL_DEFAULT_ITEMS = LOVE_MURAL_STATIC_FILES.map((fileName, index) => ({
  id: `mural-${index + 1}`,
  src: `../src/assets/mural/${fileName}`,
  fileName,
  title: 'Nosso mural',
  description: '',
  isDefault: true
}));

let loveMuralItems = [];
let loveMuralVisibleItems = [];
let loveMuralCaptions = {};
let activeLoveMuralItemId = null;
let activeLoveMuralFileName = '';
let loveMuralRotation = { x: -8, y: 0 };
let loveMuralVelocity = { x: 0, y: 0 };
let loveMuralDragging = false;
let loveMuralLastPointer = { x: 0, y: 0 };
let loveMuralStartPointer = { x: 0, y: 0 };
let loveMuralPointerDownIndex = null;
let loveMuralPointerMoved = false;
let loveMuralPointerOpened = false;
let loveMuralAnimationFrame = null;

function escapeMuralHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createLoveMuralId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `mural-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function setLoveMuralStatus(message) {
  const status = document.getElementById('loveMuralStatus');
  if (status) status.textContent = message || '';
}

function loveMuralItemUrl(item) {
  if (item.src) return item.src;
  if (item.public_url) return item.public_url;
  if (window.loveSupabase && item.storage_path) {
    return window.loveSupabase.getPublicUrl(item.storage_path);
  }
  return item.storage_path || '';
}

function mapSupabaseMuralItem(item) {
  return {
    id: item.id,
    storage_path: item.storage_path,
    public_url: item.public_url,
    src: item.public_url || (window.loveSupabase ? window.loveSupabase.getPublicUrl(item.storage_path) : item.storage_path),
    title: item.title || '',
    description: item.description || '',
    displayOrder: item.display_order || 0
  };
}

function saveLoveMuralLocal() {
  const savedItems = loveMuralItems.filter(item => !item.isDefault);
  localStorage.setItem(LOVE_MURAL_STORAGE_KEY, JSON.stringify(savedItems));
}

function saveLoveMuralCaptionsLocal() {
  localStorage.setItem(LOVE_MURAL_CAPTIONS_STORAGE_KEY, JSON.stringify(loveMuralCaptions));
}

function setLoveMuralCaptionStatus(message) {
  const status = document.getElementById('loveMuralCaptionStatus');
  if (status) status.textContent = message || '';
}

function normalizeLoveMuralCaption(value) {
  if (!value) return { title: '', note: '' };
  if (typeof value === 'string') return { title: '', note: value };
  return {
    title: value.title || '',
    note: value.note || ''
  };
}

function mapSupabaseMuralCaption(row) {
  return [row.file_name, { title: row.title || '', note: row.note || '' }];
}

async function loadLoveMuralCaptions() {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data, error } = await window.loveSupabase.client
        .from('love_mural_captions')
        .select('file_name, title, note');

      if (error) throw error;
      loveMuralCaptions = Object.fromEntries((data || []).map(mapSupabaseMuralCaption));
      return;
    } catch (error) {
      console.warn('Supabase indisponivel para legendas do mural, usando localStorage.', error);
    }
  }

  try {
    loveMuralCaptions = JSON.parse(localStorage.getItem(LOVE_MURAL_CAPTIONS_STORAGE_KEY) || '{}');
  } catch (error) {
    loveMuralCaptions = {};
  }
}

async function loadLoveMuralItems() {
  loveMuralItems = [];
  await loadLoveMuralCaptions();

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data, error } = await window.loveSupabase.client
        .from('love_mural_items')
        .select('id, storage_path, public_url, title, description, display_order, created_at')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      loveMuralItems = (data || []).map(mapSupabaseMuralItem);
      renderLoveMural();
      return;
    } catch (error) {
      console.warn('Supabase indisponivel para mural, usando localStorage.', error);
      setLoveMuralStatus('Mural salvo neste aparelho enquanto o Supabase não responde.');
    }
  }

  try {
    loveMuralItems = JSON.parse(localStorage.getItem(LOVE_MURAL_STORAGE_KEY) || '[]');
  } catch (error) {
    loveMuralItems = [];
  }
  renderLoveMural();
}

function getLoveMuralDisplayItems() {
  const items = loveMuralItems.length > 0 ? loveMuralItems : LOVE_MURAL_DEFAULT_ITEMS;
  return items.map(item => ({
    ...item,
    title: item.fileName && loveMuralCaptions[item.fileName] ? (normalizeLoveMuralCaption(loveMuralCaptions[item.fileName]).title || item.title) : item.title,
    description: item.fileName && loveMuralCaptions[item.fileName] ? (normalizeLoveMuralCaption(loveMuralCaptions[item.fileName]).note || item.description) : item.description
  }));
}

function previewLoveMuralFiles(input) {
  const preview = document.getElementById('loveMuralPreview');
  const files = Array.from(input.files || []);
  if (!preview) return;
  preview.innerHTML = '';

  files.slice(0, 8).forEach(file => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    img.onload = () => URL.revokeObjectURL(img.src);
    preview.appendChild(img);
  });
}

function readLoveMuralFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateLoveMuralFiles(files) {
  const invalid = files.find(file => !file.type.startsWith('image/'));
  if (invalid) return `O mural aceita somente imagens. Arquivo: ${invalid.name}`;
  const oversized = files.find(file => file.size > LOVE_MURAL_MAX_IMAGE_BYTES);
  if (oversized) return `A foto "${oversized.name}" tem mais de 10 MB. Diminua a imagem e tente de novo.`;
  return '';
}

async function saveLoveMuralItems(event) {
  event.preventDefault();
  const input = document.getElementById('muralPhotosInput');
  const titleInput = document.getElementById('muralTitleInput');
  const descriptionInput = document.getElementById('muralDescriptionInput');
  const files = Array.from(input.files || []);

  if (files.length === 0) {
    alert('Escolha pelo menos uma foto para o mural.');
    return;
  }

  const validationError = validateLoveMuralFiles(files);
  if (validationError) {
    alert(validationError);
    return;
  }

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  setLoveMuralStatus('Enviando fotos para o mural...');

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const uploadedPaths = [];
    try {
      const rows = [];
      const orderBase = Math.floor(Date.now() / 1000);
      for (const [index, file] of files.entries()) {
        const uploaded = await window.loveSupabase.uploadImage('mural', file);
        uploadedPaths.push(uploaded.storage_path);
        rows.push({
          storage_path: uploaded.storage_path,
          public_url: uploaded.public_url,
          title: title || null,
          description: description || null,
          display_order: orderBase + index
        });
      }

      const { error } = await window.loveSupabase.client
        .from('love_mural_items')
        .insert(rows);

      if (error) throw error;
      input.value = '';
      titleInput.value = '';
      descriptionInput.value = '';
      document.getElementById('loveMuralPreview').innerHTML = '';
      await loadLoveMuralItems();
      setLoveMuralStatus('');
      return;
    } catch (error) {
      console.warn('Erro ao salvar mural no Supabase.', error);
      if (uploadedPaths.length) {
        await window.loveSupabase.client.storage
          .from(window.loveSupabase.storageBucket)
          .remove(uploadedPaths);
      }
      setLoveMuralStatus('Não consegui salvar no Supabase agora. Guardando neste aparelho.');
    }
  }

  const localItems = [];
  const localOrderBase = Math.floor(Date.now() / 1000);
  for (const [index, file] of files.entries()) {
    const src = await readLoveMuralFileAsDataUrl(file);
    localItems.push({
      id: createLoveMuralId(),
      src,
      title,
      description,
      displayOrder: localOrderBase + index
    });
  }

  loveMuralItems = [...localItems, ...loveMuralItems.filter(item => !item.isDefault)];
  saveLoveMuralLocal();
  input.value = '';
  titleInput.value = '';
  descriptionInput.value = '';
  document.getElementById('loveMuralPreview').innerHTML = '';
  renderLoveMural();
}

function renderLoveMural() {
  const sphere = document.getElementById('loveMuralSphere');
  if (!sphere) return;

  loveMuralVisibleItems = getLoveMuralDisplayItems().filter(item => loveMuralItemUrl(item));

  if (loveMuralVisibleItems.length === 0) {
    sphere.innerHTML = '<div class="love-mural-empty">Adicione a primeira foto do mural.</div>';
    return;
  }

  sphere.innerHTML = loveMuralVisibleItems.map((item, index) => `
    <button class="love-mural-node" type="button" data-index="${index}" aria-label="${escapeMuralHtml(item.title || `Foto ${index + 1}`)}">
      <img src="${loveMuralItemUrl(item)}" alt="${escapeMuralHtml(item.title || `Foto ${index + 1}`)}" draggable="false">
    </button>
  `).join('');
  attachLoveMuralPointerEvents();
  updateLoveMuralSphere();
}

function getLoveMuralPosition(index, total, radius) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(total - 1, 1)) * 2;
  const circleRadius = Math.sqrt(1 - y * y);
  const theta = goldenAngle * index;
  return {
    x: Math.cos(theta) * circleRadius * radius,
    y: y * radius,
    z: Math.sin(theta) * circleRadius * radius
  };
}

function rotateLoveMuralPoint(point) {
  const rotX = loveMuralRotation.x * Math.PI / 180;
  const rotY = loveMuralRotation.y * Math.PI / 180;

  let { x, y, z } = point;
  const y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
  const z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
  y = y1;
  z = z1;

  const x2 = x * Math.cos(rotY) + z * Math.sin(rotY);
  const z2 = -x * Math.sin(rotY) + z * Math.cos(rotY);
  x = x2;
  z = z2;

  return { x, y, z };
}

function updateLoveMuralSphere() {
  const sphere = document.getElementById('loveMuralSphere');
  if (!sphere || loveMuralVisibleItems.length === 0) return;

  const size = sphere.clientWidth;
  const radius = Math.max(118, size * 0.39);
  const baseSize = Math.max(38, Math.min(62, size * 0.1));
  const nodes = sphere.querySelectorAll('.love-mural-node');

  nodes.forEach((node, index) => {
    const position = rotateLoveMuralPoint(getLoveMuralPosition(index, nodes.length, radius));
    const depth = (position.z + radius) / (radius * 2);
    const scale = 0.68 + depth * 0.34;
    const opacity = position.z < -radius * 0.62 ? 0.18 : 0.55 + depth * 0.45;
    const imageSize = baseSize * scale;

    node.style.width = `${imageSize}px`;
    node.style.height = `${imageSize}px`;
    node.style.left = `${size / 2 + position.x}px`;
    node.style.top = `${size / 2 + position.y}px`;
    node.style.opacity = opacity.toFixed(2);
    node.style.zIndex = String(Math.round(1000 + position.z));
    node.style.transform = 'translate(-50%, -50%)';
  });
}

function animateLoveMuralSphere() {
  if (!loveMuralDragging) {
    loveMuralRotation.y += 0.12 + loveMuralVelocity.y;
    loveMuralRotation.x += loveMuralVelocity.x;
    loveMuralVelocity.x *= 0.94;
    loveMuralVelocity.y *= 0.94;
  }
  updateLoveMuralSphere();
  loveMuralAnimationFrame = requestAnimationFrame(animateLoveMuralSphere);
}

function attachLoveMuralPointerEvents() {
  const sphere = document.getElementById('loveMuralSphere');
  if (!sphere || sphere.dataset.ready === 'true') return;
  sphere.dataset.ready = 'true';

  sphere.addEventListener('pointerdown', event => {
    const node = event.target.closest('.love-mural-node');
    loveMuralDragging = true;
    loveMuralPointerMoved = false;
    loveMuralPointerOpened = false;
    loveMuralPointerDownIndex = node ? Number(node.dataset.index) : null;
    loveMuralVelocity = { x: 0, y: 0 };
    loveMuralStartPointer = { x: event.clientX, y: event.clientY };
    loveMuralLastPointer = { x: event.clientX, y: event.clientY };
    sphere.setPointerCapture(event.pointerId);
  });

  sphere.addEventListener('pointermove', event => {
    if (!loveMuralDragging) return;
    const deltaX = event.clientX - loveMuralLastPointer.x;
    const deltaY = event.clientY - loveMuralLastPointer.y;
    const totalMove = Math.hypot(event.clientX - loveMuralStartPointer.x, event.clientY - loveMuralStartPointer.y);
    if (totalMove > LOVE_MURAL_TAP_MOVE_THRESHOLD) loveMuralPointerMoved = true;

    if (loveMuralPointerDownIndex !== null && totalMove < LOVE_MURAL_NODE_DRAG_THRESHOLD) {
      loveMuralLastPointer = { x: event.clientX, y: event.clientY };
      return;
    }

    loveMuralRotation.y += deltaX * 0.45;
    loveMuralRotation.x -= deltaY * 0.28;
    loveMuralVelocity.y = deltaX * 0.018;
    loveMuralVelocity.x = -deltaY * 0.012;
    loveMuralLastPointer = { x: event.clientX, y: event.clientY };
    updateLoveMuralSphere();
  });

  sphere.addEventListener('pointerup', event => {
    const totalMove = Math.hypot(event.clientX - loveMuralStartPointer.x, event.clientY - loveMuralStartPointer.y);
    const shouldOpen = loveMuralPointerDownIndex !== null && totalMove <= LOVE_MURAL_TAP_MOVE_THRESHOLD;
    loveMuralDragging = false;
    if (sphere.hasPointerCapture(event.pointerId)) {
      sphere.releasePointerCapture(event.pointerId);
    }
    if (shouldOpen) {
      event.preventDefault();
      openLoveMuralItem(loveMuralPointerDownIndex);
      loveMuralPointerOpened = true;
      loveMuralPointerMoved = true;
    }
    loveMuralPointerDownIndex = null;
  });

  sphere.addEventListener('pointercancel', () => {
    loveMuralDragging = false;
    loveMuralPointerDownIndex = null;
    loveMuralPointerOpened = false;
  });

  sphere.addEventListener('click', event => {
    if (loveMuralPointerOpened) {
      loveMuralPointerOpened = false;
      event.preventDefault();
      return;
    }
    const node = event.target.closest('.love-mural-node');
    if (!node || loveMuralPointerMoved) return;
    openLoveMuralItem(Number(node.dataset.index));
  });
}

function openLoveMuralItem(index) {
  const item = loveMuralVisibleItems[index];
  if (!item) return;
  activeLoveMuralItemId = item.id;
  activeLoveMuralFileName = item.fileName || '';
  const caption = activeLoveMuralFileName ? normalizeLoveMuralCaption(loveMuralCaptions[activeLoveMuralFileName]) : { title: item.title || '', note: item.description || '' };
  const title = caption.title || item.title || 'Foto do nosso mural';
  const note = caption.note || item.description || '';

  document.getElementById('loveMuralModalImage').src = loveMuralItemUrl(item);
  document.getElementById('loveMuralModalImage').alt = item.title || 'Foto do mural';
  document.getElementById('loveMuralModalTitle').textContent = title;
  document.getElementById('loveMuralModalDescription').textContent = note || 'Use o botão abaixo para escrever um textinho para essa foto.';
  document.getElementById('loveMuralTitleInput').value = caption.title || '';
  document.getElementById('loveMuralCaptionInput').value = caption.note || '';
  const editButton = document.getElementById('loveMuralEditButton');
  if (editButton) {
    editButton.textContent = (note || caption.title) ? 'Editar texto' : 'Adicionar texto';
    editButton.hidden = false;
  }
  closeLoveMuralCaptionEditor();
  setLoveMuralCaptionStatus('');
  document.getElementById('loveMuralDeleteButton').hidden = Boolean(item.isDefault);

  const modal = document.getElementById('loveMuralModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

async function saveLoveMuralCaption(event) {
  event.preventDefault();
  if (!activeLoveMuralFileName) return;

  const titleInput = document.getElementById('loveMuralTitleInput');
  const noteInput = document.getElementById('loveMuralCaptionInput');
  const title = titleInput.value.trim();
  const note = noteInput.value.trim();
  setLoveMuralCaptionStatus('Salvando...');

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { error } = await window.loveSupabase.client
        .from('love_mural_captions')
        .upsert({
          file_name: activeLoveMuralFileName,
          title,
          note,
          updated_at: new Date().toISOString()
        }, { onConflict: 'file_name' });

      if (error) throw error;
      loveMuralCaptions[activeLoveMuralFileName] = { title, note };
      document.getElementById('loveMuralModalTitle').textContent = title || 'Foto do nosso mural';
      document.getElementById('loveMuralModalDescription').textContent = note || 'Use o botão abaixo para escrever um textinho para essa foto.';
      renderLoveMural();
      closeLoveMuralCaptionEditor();
      setLoveMuralCaptionStatus('Salvo no Supabase.');
      return;
    } catch (error) {
      console.warn('Erro ao salvar legenda do mural no Supabase.', error);
      setLoveMuralCaptionStatus('Supabase indisponivel. Salvei neste aparelho.');
    }
  }

  loveMuralCaptions[activeLoveMuralFileName] = { title, note };
  saveLoveMuralCaptionsLocal();
  document.getElementById('loveMuralModalTitle').textContent = title || 'Foto do nosso mural';
  document.getElementById('loveMuralModalDescription').textContent = note || 'Use o botão abaixo para escrever um textinho para essa foto.';
  renderLoveMural();
  closeLoveMuralCaptionEditor();
}

function openLoveMuralCaptionEditor() {
  const form = document.getElementById('loveMuralCaptionForm');
  const button = document.getElementById('loveMuralEditButton');
  if (form) form.hidden = false;
  if (button) button.hidden = true;
  setLoveMuralCaptionStatus('');
  const titleInput = document.getElementById('loveMuralTitleInput');
  if (titleInput) titleInput.focus();
}

function closeLoveMuralCaptionEditor() {
  const form = document.getElementById('loveMuralCaptionForm');
  const button = document.getElementById('loveMuralEditButton');
  if (form) form.hidden = true;
  if (button) button.hidden = false;
}

function closeLoveMuralModal() {
  const modal = document.getElementById('loveMuralModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

async function deleteActiveLoveMuralItem() {
  const item = loveMuralItems.find(muralItem => muralItem.id === activeLoveMuralItemId);
  if (!item || item.isDefault) return;
  if (!confirm('Excluir essa foto do mural?')) return;

  setLoveMuralStatus('Excluindo foto...');

  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { error } = await window.loveSupabase.client
        .from('love_mural_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      if (item.storage_path) {
        await window.loveSupabase.client.storage
          .from(window.loveSupabase.storageBucket)
          .remove([item.storage_path]);
      }
      await loadLoveMuralItems();
      closeLoveMuralModal();
      setLoveMuralStatus('');
      return;
    } catch (error) {
      console.warn('Erro ao excluir foto do mural no Supabase.', error);
      setLoveMuralStatus('Não consegui excluir no Supabase agora. Removendo deste aparelho.');
    }
  }

  loveMuralItems = loveMuralItems.filter(muralItem => muralItem.id !== item.id);
  saveLoveMuralLocal();
  renderLoveMural();
  closeLoveMuralModal();
}

document.addEventListener('DOMContentLoaded', () => {
  loadLoveMuralItems();
  if (!loveMuralAnimationFrame) animateLoveMuralSphere();
  window.addEventListener('resize', updateLoveMuralSphere);
});
