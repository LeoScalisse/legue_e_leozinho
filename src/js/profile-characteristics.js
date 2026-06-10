const defaultCharacteristics = [
  {
    name: 'Beleza',
    value: 7,
    base: '#fe8ce4'
  },
  {
    name: 'Coberto com a Raz\u00e3o',
    value: 4,
    base: '#8cc8e4'
  },
  {
    name: 'Rom\u00e2ntico',
    value: 12,
    base: '#6cc484'
  }
];

function localProfileKey(profileSlug) {
  return `profileCharacteristics:${profileSlug}`;
}

function normalizeCharacteristic(item, index) {
  return {
    name: item.name || `Atributo ${index + 1}`,
    value: Number(item.value || 1),
    base: item.base || item.base_color || '#7ec8e3'
  };
}

async function loadProfileCharacteristics(profileSlug) {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    try {
      const { data, error } = await window.loveSupabase.client
        .from('profile_attributes')
        .select('name, value, base_color, display_order')
        .eq('profile_slug', profileSlug)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((item, index) => normalizeCharacteristic({
          name: item.name,
          value: item.value,
          base: item.base_color
        }, index));
      }
    } catch (error) {
      console.warn('Supabase indisponivel para atributos, usando fallback local.', error);
    }
  }

  try {
    const saved = localStorage.getItem(localProfileKey(profileSlug));
    if (saved) return JSON.parse(saved).map(normalizeCharacteristic);
  } catch (error) {}

  return defaultCharacteristics;
}

function saveLocalProfileCharacteristics(profileSlug, items) {
  try {
    localStorage.setItem(localProfileKey(profileSlug), JSON.stringify(items));
  } catch (error) {}
}

async function saveAllProfileCharacteristics(profileSlug, items) {
  const normalizedItems = items.map(normalizeCharacteristic);
  saveLocalProfileCharacteristics(profileSlug, normalizedItems);

  if (!window.loveSupabase || !window.loveSupabase.isReady()) {
    return;
  }

  const rows = normalizedItems.map((item, index) => ({
    profile_slug: profileSlug,
    name: item.name,
    value: Number(item.value),
    base_color: item.base,
    display_order: index,
    updated_at: new Date().toISOString()
  }));

  const { error } = await window.loveSupabase.client
    .from('profile_attributes')
    .upsert(rows, { onConflict: 'profile_slug,name' });

  if (error) throw error;
}

function CharacteristicMeter({ item, index, onValueChange }) {
  return React.createElement(
    'label',
    { className: 'characteristic-meter' },
    React.createElement(
      'span',
      { className: 'characteristic-name' },
      item.name
    ),
    React.createElement('input', {
      type: 'range',
      min: '1',
      max: '20',
      value: item.value,
      className: 'kawaii',
      style: { '--base': item.base },
      onChange: event => onValueChange(index, event.target.value),
      'aria-label': item.name
    })
  );
}

function NewCharacteristicCard({ draft, isOpen, onOpen, onCancel, onDraftChange, onAdd }) {
  if (!isOpen) {
    return React.createElement(
      'button',
      {
        type: 'button',
        className: 'characteristic-create-card characteristic-create-collapsed',
        onClick: onOpen
      },
      '+ Criar novo atributo'
    );
  }

  return React.createElement(
    'section',
    { className: 'characteristic-create-card', 'aria-label': 'Criar novo atributo' },
    React.createElement('h2', null, '+ Criar novo atributo'),
    React.createElement(
      'div',
      { className: 'characteristic-create-grid' },
      React.createElement('input', {
        type: 'text',
        value: draft.name,
        placeholder: 'Nome do atributo',
        onChange: event => onDraftChange({ ...draft, name: event.target.value })
      }),
      React.createElement(
        'label',
        { className: 'characteristic-color-field' },
        React.createElement('span', null, 'Cor'),
        React.createElement('input', {
          type: 'color',
          value: draft.base,
          onChange: event => onDraftChange({ ...draft, base: event.target.value })
        })
      ),
      React.createElement(
        'label',
        { className: 'characteristic-value-field' },
        React.createElement('span', null, `Grau ${draft.value}`),
        React.createElement('input', {
          type: 'range',
          min: '1',
          max: '20',
          value: draft.value,
          className: 'kawaii',
          style: { '--base': draft.base },
          onChange: event => onDraftChange({ ...draft, value: Number(event.target.value) })
        })
      )
    ),
    React.createElement(
      'div',
      { className: 'characteristic-create-actions' },
      React.createElement(
        'button',
        { type: 'button', className: 'characteristic-add-button', onClick: onAdd },
        'Adicionar atributo'
      ),
      React.createElement(
        'button',
        { type: 'button', className: 'characteristic-cancel-button', onClick: onCancel },
        'Cancelar'
      )
    )
  );
}

function CharacteristicsPanel({ profileSlug, initialItems }) {
  const [items, setItems] = React.useState(initialItems.map(normalizeCharacteristic));
  const [draft, setDraft] = React.useState({ name: '', value: 10, base: '#7ec8e3' });
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const markChanged = nextItems => {
    setItems(nextItems);
    setHasChanges(true);
    setStatus('Mudanças ainda não salvas');
  };

  const handleValueChange = (index, value) => {
    const nextItems = items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, value: Number(value) } : item
    ));
    markChanged(nextItems);
  };

  const handleAdd = () => {
    const name = draft.name.trim();
    if (!name) {
      setStatus('Escolha um nome para o novo atributo');
      return;
    }

    if (items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      setStatus('Já existe um atributo com esse nome');
      return;
    }

    markChanged([
      ...items,
      {
        name,
        value: Number(draft.value),
        base: draft.base
      }
    ]);
    setDraft({ name: '', value: 10, base: '#7ec8e3' });
    setIsCreateOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('Salvando...');

    try {
      await saveAllProfileCharacteristics(profileSlug, items);
      setHasChanges(false);
      setStatus('Mudanças salvas');
    } catch (error) {
      setStatus('Não consegui salvar no Supabase agora');
      console.warn('Erro ao salvar atributos.', error);
    } finally {
      setIsSaving(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'characteristics-editor' },
    React.createElement(
      'div',
      { className: 'rangeWrapper' },
      items.map((item, index) =>
        React.createElement(CharacteristicMeter, {
          key: `${item.name}-${index}`,
          item,
          index,
          onValueChange: handleValueChange
        })
      )
    ),
    React.createElement(NewCharacteristicCard, {
      draft,
      isOpen: isCreateOpen,
      onOpen: () => {
        setIsCreateOpen(true);
        setStatus('');
      },
      onCancel: () => {
        setIsCreateOpen(false);
        setDraft({ name: '', value: 10, base: '#7ec8e3' });
        setStatus('');
      },
      onDraftChange: nextDraft => {
        setDraft(nextDraft);
        setStatus('');
      },
      onAdd: handleAdd
    }),
    React.createElement(
      'div',
      { className: 'characteristic-save-row' },
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'characteristic-save-button',
          onClick: handleSave,
          disabled: isSaving || !hasChanges
        },
        isSaving ? 'Salvando...' : 'Salvar mudanças'
      ),
      React.createElement('span', { className: 'characteristic-save-status' }, status)
    )
  );
}

document.querySelectorAll('[data-characteristics-root]').forEach(async root => {
  const profileSlug = root.dataset.profileSlug || 'legue';
  const initialItems = await loadProfileCharacteristics(profileSlug);
  ReactDOM.createRoot(root).render(React.createElement(CharacteristicsPanel, {
    profileSlug,
    initialItems
  }));
});
