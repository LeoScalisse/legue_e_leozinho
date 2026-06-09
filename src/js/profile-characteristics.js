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
        return data.map(item => ({
          name: item.name,
          value: item.value,
          base: item.base_color
        }));
      }
    } catch (error) {
      console.warn('Supabase indisponivel para atributos, usando fallback local.', error);
    }
  }

  try {
    const saved = localStorage.getItem(localProfileKey(profileSlug));
    if (saved) return JSON.parse(saved);
  } catch (error) {}

  return defaultCharacteristics;
}

async function saveProfileCharacteristic(profileSlug, item, value, displayOrder) {
  if (window.loveSupabase && window.loveSupabase.isReady()) {
    const { error } = await window.loveSupabase.client
      .from('profile_attributes')
      .upsert({
        profile_slug: profileSlug,
        name: item.name,
        value: Number(value),
        base_color: item.base,
        display_order: displayOrder,
        updated_at: new Date().toISOString()
      }, { onConflict: 'profile_slug,name' });

    if (error) {
      console.warn('Erro ao salvar atributo no Supabase.', error);
    }
  }
}

function saveLocalProfileCharacteristics(profileSlug, items) {
  try {
    localStorage.setItem(localProfileKey(profileSlug), JSON.stringify(items));
  } catch (error) {}
}

function CharacteristicMeter({ item, index, profileSlug, onValueChange }) {
  const [value, setValue] = React.useState(item.value);

  const handleChange = event => {
    const nextValue = event.target.value;
    setValue(nextValue);
    onValueChange(index, nextValue);
    saveProfileCharacteristic(profileSlug, item, nextValue, index);
  };

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
      value,
      className: 'kawaii',
      style: { '--base': item.base },
      onChange: handleChange,
      'aria-label': item.name
    })
  );
}

function CharacteristicsPanel({ profileSlug, initialItems }) {
  const [items, setItems] = React.useState(initialItems);

  const handleValueChange = (index, value) => {
    const nextItems = items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, value: Number(value) } : item
    ));
    setItems(nextItems);
    saveLocalProfileCharacteristics(profileSlug, nextItems);
  };

  return React.createElement(
    'div',
    { className: 'rangeWrapper' },
    items.map((item, index) =>
      React.createElement(CharacteristicMeter, {
        key: item.name,
        item,
        index,
        profileSlug,
        onValueChange: handleValueChange
      })
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
