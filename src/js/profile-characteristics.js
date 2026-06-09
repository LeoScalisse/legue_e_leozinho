const characteristics = [
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

function CharacteristicMeter({ item }) {
  const [value, setValue] = React.useState(item.value);

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
      onChange: event => setValue(event.target.value),
      'aria-label': item.name
    })
  );
}

function CharacteristicsPanel() {
  return React.createElement(
    'div',
    { className: 'rangeWrapper' },
    characteristics.map(item =>
      React.createElement(CharacteristicMeter, {
        key: item.name,
        item
      })
    )
  );
}

document.querySelectorAll('[data-characteristics-root]').forEach(root => {
  ReactDOM.createRoot(root).render(React.createElement(CharacteristicsPanel));
});
