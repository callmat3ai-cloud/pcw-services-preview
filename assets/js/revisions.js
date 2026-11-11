/* Presentation-only additions. Estimate transport and CRM integration remain in unchanged main.js. */
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.pcw-carousel');
  if (carousel) {
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    const choices = [...carousel.querySelectorAll('[data-carousel-index]')];
    const status = carousel.querySelector('.carousel-status');
    let current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== current;
        slide.setAttribute('aria-hidden', String(i !== current));
        slide.inert = i !== current;
      });
      choices.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.carouselIndex) === current)));
      status.textContent = `${current + 1} / ${slides.length}`;
    }
    carousel.classList.add('is-ready');
    carousel.querySelector('.carousel-controls').hidden = false;
    carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => show(current - 1));
    carousel.querySelector('[data-carousel-next]').addEventListener('click', () => show(current + 1));
    choices.forEach(button => button.addEventListener('click', () => show(Number(button.dataset.carouselIndex))));
    carousel.addEventListener('keydown', event => {
      if (event.target.closest('input,textarea,select')) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
      if (event.key === 'Home') { event.preventDefault(); show(0); }
      if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    });
    let start = null;
    carousel.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') start = {x:event.clientX, y:event.clientY};
    }, {passive:true});
    carousel.addEventListener('pointerup', event => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
      start = null;
    }, {passive:true});
    carousel.addEventListener('pointercancel', () => { start = null; }, {passive:true});
    show(0);
  }
  const search = document.getElementById('guide-search');
  if (search) {
    const cards = [...document.querySelectorAll('#guide-list .guide-card')];
    const results = document.getElementById('guide-results');
    const empty = document.getElementById('guide-empty');
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase();
      let count = 0;
      cards.forEach(card => {
        card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
        if (!card.hidden) count++;
      });
      results.textContent = `${count} ${count === 1 ? 'guide' : 'guides'}${query ? ' found' : ''}`;
      empty.hidden = count !== 0;
    });
  }
});
