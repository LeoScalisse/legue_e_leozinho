(function () {
  const SPECIAL_HEART_INTERVAL_MS = 60000;
  const specialHeartColors = [
    '#e11d48',
    '#f472b6',
    '#fb923c',
    '#facc15',
    '#84cc16',
    '#10b981',
    '#0ea5e9',
    '#3b82f6',
    '#8b5cf6',
    '#a78bfa',
    '#92400e'
  ];

  const defaultSpecialHeartContent = {
    title: 'Good amor?',
    text: 'Amor fica esperta que vira e mexe vai passar uns corações especiais para você que é muito especial, cuidado pra não perder!',
    color: '#facc15'
  };

  function getAssetPath(path) {
    const prefix = window.location.pathname.includes('/pages/') ? '../src/assets/' : 'src/assets/';
    return `${prefix}${path}`;
  }

  const specialHeartContents = [
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-01.jpg',
      imageAlt: 'Gatos preto e branco em foto divertida'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-02.jpg',
      imageAlt: 'Pinguins juntos na neve'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-03.jpg',
      imageAlt: 'Araras azuis encostadas uma na outra'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-04.jpg',
      imageAlt: 'Preguicas sorrindo com girassol'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-05.jpg',
      imageAlt: 'Cachorrinhos se beijando'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-06.jpg',
      imageAlt: 'Gatinhos dormindo abracados'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-07.jpg',
      imageAlt: 'Gatos preto e branco abraçados'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-08.jpg',
      imageAlt: 'Banguela e Furia da Luz lado a lado'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-09.jpg',
      imageAlt: 'Gatos fazendo careta juntos'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-10.jpg',
      imageAlt: 'Lontras se beijando'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-11.jpg',
      imageAlt: 'Patinhos vestidos de noiva e noivo'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-12.png',
      imageAlt: 'Casal em um universo de dojo'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-13.png',
      imageAlt: 'Casal em um universo de banda no palco'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-14.png',
      imageAlt: 'Casal em um universo de assalto cinematografico'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-15.png',
      imageAlt: 'Casal em um universo de bebes sorrindo'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-16.png',
      imageAlt: 'Casal em um universo de quadra esportiva'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-17.png',
      imageAlt: 'Casal em um universo de sabres de luz'
    },
    {
      title: 'US IN OTHER UNIVERSE',
      image: 'special-hearts/us-in-other-universe/us-other-18.png',
      imageAlt: 'Casal com camisas de futebol'
    },
    {
      title: 'TOMA!',
      image: 'special-hearts/toma/toma-1.jpeg',
      imageAlt: 'Casal segurando hamburgueres'
    },
    {
      title: 'TOMA!',
      image: 'special-hearts/toma/toma-2.jpeg',
      imageAlt: 'Leozinho sorrindo com gato enrolado na toalha'
    },
    {
      title: 'TOMA!',
      image: 'special-hearts/toma/toma-3.jpeg',
      imageAlt: 'Time infantil comemorando medalhas'
    },
    {
      title: 'TOMA!',
      image: 'special-hearts/toma/toma-4.jpeg',
      imageAlt: 'Campo de futebol com pessoa no gramado'
    },
    {
      title: 'TOMA!',
      image: 'special-hearts/toma/toma-5.jpeg',
      imageAlt: 'Legue sorrindo no barco'
    },
    {
      title: 'TOMA!',
      image: 'special-hearts/toma/toma-6.jpeg',
      imageAlt: 'Casal em selfie divertida'
    },
    {
      title: 'Vem de TbT',
      image: 'special-hearts/vem-de-tbt.jpeg',
      imageAlt: 'Foto antiga do casal com filtro roxo'
    },
    {
      title: 'S\u00f3 porque sim',
      custom: 'bb8-toggle'
    },
    {
      title: 'Takoiaki',
      text: 'Lembra desse dia? Foi bem legal ir na liberdade, n\u00e3o esperava que fosse gostar tanto, masss.... se lembra do que tamb\u00e9m aconteceu esse dia? \uD83D\uDD11\uD83D\uDEAA',
      image: 'special-hearts/takoiaki.jpeg',
      imageAlt: 'Casal sorrindo na Liberdade com comida japonesa'
    },
    {
      title: 'Vale Cookie',
      text: 'Te devo um cookie, disque para 11950845288 e informe que ganhou seu premio!'
    },
    {
      title: 'Obrigado',
      text: 'Obrigado por me amar amor, obrigado por ter me escolhido e não ter desistido de mim. Espero que esteja gostando do site, eu te amo demais amor!!!!'
    },
    {
      title: 'EU SEI',
      text: 'Tô de corpo mole, mas vou fazer a autoescola logo para gente poder ir lá no shopping Morumbi e tantos outros lugares, o mar é o limite porque ainda infelizmente não possuem estradas pra ir pra Itália, ainda...'
    },
    {
      title: 'De lei',
      text: 'De lei tem que ter um inception, a quebra da quarta parede né. Então agora são 15:29 do dia 10/06 e tô aqui esperando você sair do shopping Tatuapé... aaaa que espera cruel'
    },
    {
      title: 'Lua de honey',
      text: 'Bate pronto passar lua de mel na Grécia ou na Itália, mais cedo ou mais tarde vamos pros 2, mas eu escolho Grécia, deve ser muito top lá pô'
    },
    {
      title: 'Fan Fact',
      text: 'EU tô jogando modo carreira né, aí estou treinando a Roma de italy leia com sotaques italiani per favore e tava precisani de um lateral esquierdo e como chegou la atualizacion da Copa de Mundo um lateral esquierdo uruguaio do seu time entrou no jogo, cogitei, mas por questões éticas não, ele não participará do meu time jamais Cretino!'
    },
    {
      title: 'Ahá',
      text: 'Fetutine Alá carbonara. Agora não esqueço mais!'
    },
    {
      title: 'Fim de noite',
      text: 'Deixa eu contar esse nossa história hoje, vamo ser mais que amor de fim de noite, posso fazer bem melhor do que da ultima vez e fazer bem melhor do que seu ex um dia te fez! Não que você tenha ex né. Somos os primeiros um do outro, o primeiro amor o atual e assim será para todo sempre'
    },
    {
      title: '15:40',
      text: 'A espera acabou você me pediu pra ir pro Tatuapé, mas quebrou meu coração, comendo Chiquinho sem mim... só por ia sugerir de pegarmos para nós... ó mundo cruel'
    },
    {
      title: '19:14',
      text: 'Agora são 19:14 e seguem 2 dilemas qual vai ser o lugar do dia dos namorados? La mansion ou Siamo? E também, vou pro boxe? Mas hoje fica marcado, dia 10/06/2026, um dia antes da copa, como o dia do melhor...'
    },
    {
      title: 'Teta',
      text: 'Opa! se caiu aqui tenho um desafio bem teta, bem mel na chupeta. O desafio é mandar uma fotinho bem good se é que me entende hehehe'
    },
    {
      title: 'Percebeu?',
      text: 'Percebeu que em nenhum desses corações as mensagens tem ponto final no final deles? Erro de gramática damn hauny Não! absolutamente não! É só que assim como esses corações nosso amor não tem um ponto final, pode passar por vírgulas, as vezes boas e ruins mas nunca um ponto final! obs: Se ver algum ponto final finalizando esses corações pode me cobrar. obs: O do lado eu acabei com parênteses tá? não com ponto final'
    },
    {
      title: 'Alguém já deve ter falado isso',
      text: 'ahhh batata'
    },
    {
      title: 'Realmente tentei sem roubar',
      text: 'S-A-L-S-I-C-H-A consegui hehehe'
    },
    {
      title: 'Benny?',
      text: 'Obrigado meu amor. Sem você eu ia ter aceitado viver sem a luna, obrigao por me ter feito insistir nisso e conseguir the benny que vai ser nossa companheira na nossa futura casa'
    },
    {
      title: 'SIM!',
      text: 'Você desceu primeiro no no escorregador do Wet and Wild'
    },
    {
      title: 'Music time',
      text: 'Eu você 3 filhos Lucca, Maria Vitória, Lorenzo e 1 cachorro Salsichaannn e um Gatoôoo Luna oôôôooo'
    },
    {
      title: 'Dica',
      text: 'Não esquece de clicar nos nossos nomes lá no título do site amor!'
    }
  ];

  let lastColor = '';
  let contentQueue = [];

  function pickRandomItem(items, previousValue, getValue) {
    if (items.length <= 1) return items[0];

    let nextItem = items[Math.floor(Math.random() * items.length)];
    let attempts = 0;
    while (getValue(nextItem) === previousValue && attempts < 10) {
      nextItem = items[Math.floor(Math.random() * items.length)];
      attempts += 1;
    }
    return nextItem;
  }

  function shuffleItems(items) {
    const shuffled = items.slice();
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function getNextQueuedContent() {
    if (contentQueue.length === 0) {
      contentQueue = shuffleItems(specialHeartContents);
    }

    return contentQueue.shift();
  }

  function getNextSpecialHeartContent() {
    const nextContent = getNextQueuedContent();
    const color = pickRandomItem(specialHeartColors, lastColor, item => item);

    lastColor = color;

    return {
      title: nextContent.title,
      text: nextContent.text,
      image: nextContent.image,
      imageAlt: nextContent.imageAlt,
      custom: nextContent.custom,
      color
    };
  }

  function createBb8ToggleMarkup() {
    return `<div class="special-heart-bb8-wrap">
      <label class="bb8-toggle" aria-label="Interruptor BB-8">
        <input class="bb8-toggle__checkbox" type="checkbox">
        <span class="bb8-toggle__container">
          <span class="bb8-toggle__scenery">
            <span class="bb8-toggle__star"></span>
            <span class="bb8-toggle__star"></span>
            <span class="bb8-toggle__star"></span>
            <span class="bb8-toggle__star"></span>
            <span class="bb8-toggle__star"></span>
            <span class="bb8-toggle__star"></span>
            <span class="bb8-toggle__star"></span>
            <span class="tatto-1"></span>
            <span class="tatto-2"></span>
            <span class="gomrassen"></span>
            <span class="hermes"></span>
            <span class="chenini"></span>
            <span class="bb8-toggle__cloud"></span>
            <span class="bb8-toggle__cloud"></span>
            <span class="bb8-toggle__cloud"></span>
          </span>
          <span class="bb8">
            <span class="bb8__head-container">
              <span class="bb8__antenna"></span>
              <span class="bb8__antenna"></span>
              <span class="bb8__head"></span>
            </span>
            <span class="bb8__body"></span>
          </span>
          <span class="artificial__hidden">
            <span class="bb8__shadow"></span>
          </span>
        </span>
      </label>
    </div>`;
  }

  function ensureSpecialHeartPopup() {
    let popup = document.getElementById('heartPopup');
    if (popup) {
      const content = popup.querySelector('.heart-popup-content');
      if (content && !content.querySelector('.heart-popup-extra')) {
        content.insertAdjacentHTML('beforeend', '<div class="heart-popup-extra"></div>');
      }
      return popup;
    }

    popup = document.createElement('div');
    popup.className = 'heart-popup';
    popup.id = 'heartPopup';
    popup.setAttribute('aria-hidden', 'true');
    popup.addEventListener('click', closeSpecialHeartPopup);
    popup.innerHTML = `<div class="heart-popup-content" role="dialog" aria-modal="true" aria-labelledby="heartPopupTitle">
      <button class="heart-popup-close" type="button" aria-label="Fechar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" />
  <path d="M8.5 8.5L15.5 15.5" />
  <path d="M15.5 8.5L8.5 15.5" />
</svg></button>
      <div class="heart-popup-icon">
        <svg viewBox="0 0 24 24" fill="#facc15" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C12 21 3 15 3 9C3 6.2 5.2 4 8 4C9.6 4 11 4.9 12 6.2C13 4.9 14.4 4 16 4C18.8 4 21 6.2 21 9C21 15 12 21 12 21Z"/>
        </svg>
      </div>
      <h3 id="heartPopupTitle"></h3>
      <p></p>
      <div class="heart-popup-extra"></div>
    </div>`;

    popup.querySelector('.heart-popup-content').addEventListener('click', event => event.stopPropagation());
    popup.querySelector('.heart-popup-close').addEventListener('click', closeSpecialHeartPopup);
    document.body.appendChild(popup);
    return popup;
  }

  function setSpecialHeartPopupContent(content) {
    const popupContent = content || defaultSpecialHeartContent;
    const popup = ensureSpecialHeartPopup();
    const title = popup.querySelector('#heartPopupTitle');
    const text = popup.querySelector('.heart-popup-content p');
    const icon = popup.querySelector('.heart-popup-icon svg');
    const extra = popup.querySelector('.heart-popup-extra');

    title.textContent = popupContent.title;
    text.textContent = popupContent.text || '';
    text.hidden = !popupContent.text;
    icon.setAttribute('fill', popupContent.color || defaultSpecialHeartContent.color);

    if (popupContent.custom === 'bb8-toggle') {
      extra.innerHTML = createBb8ToggleMarkup();
    } else if (popupContent.image) {
      extra.innerHTML = `<img class="heart-popup-image" src="${getAssetPath(popupContent.image)}" alt="${popupContent.imageAlt || ''}">`;
    } else {
      extra.innerHTML = '';
    }
  }

  function openSpecialHeartPopup(content) {
    setSpecialHeartPopupContent(content);
    const popup = ensureSpecialHeartPopup();
    popup.classList.add('open');
    popup.setAttribute('aria-hidden', 'false');
  }

  function closeSpecialHeartPopup() {
    const popup = document.getElementById('heartPopup');
    if (!popup) return;
    popup.classList.remove('open');
    popup.setAttribute('aria-hidden', 'true');
  }

  function createSpecialHeartsLayer() {
    let layer = document.getElementById('specialHeartsLayer');
    if (layer) return layer;

    layer = document.createElement('div');
    layer.id = 'specialHeartsLayer';
    layer.className = 'special-hearts-layer';
    document.body.appendChild(layer);
    return layer;
  }

  function createSpecialHeart() {
    const layer = createSpecialHeartsLayer();
    const content = getNextSpecialHeartContent();
    const heart = document.createElement('button');
    const size = 34 + Math.random() * 22;
    const left = 6 + Math.random() * 88;
    const duration = 9 + Math.random() * 5;
    const drift = Math.round((Math.random() * 80) - 40);

    heart.type = 'button';
    heart.className = 'special-heart-float';
    heart.setAttribute('aria-label', 'Abrir conteúdo especial');
    heart.style.cssText = `left:${left}%;--size:${size}px;--heart-color:${content.color};--drift:${drift}px;animation-duration:${duration}s;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" fill="${content.color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21C12 21 3 15 3 9C3 6.2 5.2 4 8 4C9.6 4 11 4.9 12 6.2C13 4.9 14.4 4 16 4C18.8 4 21 6.2 21 9C21 15 12 21 12 21Z"/>
    </svg>`;

    heart.addEventListener('click', () => {
      openSpecialHeartPopup(content);
      heart.remove();
    });
    heart.addEventListener('animationend', () => heart.remove());

    layer.appendChild(heart);
  }

  function startSpecialHearts() {
    ensureSpecialHeartPopup();
    window.setTimeout(createSpecialHeart, SPECIAL_HEART_INTERVAL_MS);
    window.setInterval(createSpecialHeart, SPECIAL_HEART_INTERVAL_MS);
  }

  window.openSpecialHeartPopup = openSpecialHeartPopup;
  window.closeSpecialHeartPopup = closeSpecialHeartPopup;
  window.createSpecialHeart = createSpecialHeart;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSpecialHearts);
  } else {
    startSpecialHearts();
  }
})();
