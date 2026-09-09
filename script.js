'use strict';
(() => {
  const hero = document.querySelector('.hero');
  const button = document.querySelector('.motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;

  function sync() {
    hero.classList.toggle('paused', paused);
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
    button.querySelector('.motion-label').textContent = paused ? 'Resume motion' : 'Pause motion';
    button.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
  }

  button.addEventListener('click', () => {
    paused = !paused;
    sync();
    dispatchEvent(new Event('tta-motion-change'));
  });

  reduced.addEventListener('change', () => {
    paused = reduced.matches;
    sync();
  });

  sync();
})();
