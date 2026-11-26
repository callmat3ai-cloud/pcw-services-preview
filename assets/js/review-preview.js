(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.review-carousel').forEach(grid=>{
  const cards=Array.from(grid.children);
  const status=grid.previousElementSibling&&grid.previousElementSibling.matches('.review-carousel-status')?grid.previousElementSibling:null;
  if(!cards.length) return;
  cards.forEach(card=>{
    const category=card.querySelector('.fd-testimonial-category,.review-cat')?card.querySelector('.fd-testimonial-category,.review-cat').textContent.trim():'';
    const title=card.querySelector('.fd-review-title,.review-title');
    if(category&&title&&category===title.textContent.trim()) card.classList.add('is-duplicate-role');
  });
  const visible=()=> (window.innerWidth>=821?3:1);
  if(!grid.classList.contains('track-ready')){
    const wrap=document.createElement('div'); wrap.className='review-track';
    while(grid.firstChild) wrap.appendChild(grid.firstChild);
    grid.appendChild(wrap);
    grid.classList.add('track-ready');
  }
  const wrap=grid.querySelector('.review-track');
  let index=0,timer=null;
  const show=()=>{
    if(!wrap) return;
    const v=visible(); const max=Math.max(0,cards.length-v);
    const i=Math.min(index,max);
    wrap.style.transform='translateX(-'+(i*(100/v))+'%)';
    if(status){ const a=Math.min(i+1,cards.length), b=Math.min(i+v,cards.length); status.textContent=a+' - '+b+' of '+cards.length; }
  };
  const stop=()=>{ if(timer){clearInterval(timer); timer=null;} };
  const start=()=>{ stop(); if(reduced.matches||grid.matches(':hover')||grid.contains(document.activeElement)) return; timer=setInterval(()=>{ index=(index+1)%cards.length; show(); },1500); };
  grid.classList.add('is-active');
  show(); start();
  grid.addEventListener('mouseenter',stop);
  grid.addEventListener('mouseleave',()=>setTimeout(start,0));
  grid.addEventListener('focusin',stop);
  grid.addEventListener('focusout',()=>setTimeout(start,0));
  window.addEventListener('resize',()=>{ index=0; show(); });
  reduced.addEventListener('change',e=>{ if(e.matches){ stop(); if(wrap)wrap.style.transform='translateX(0)'; } else start(); });
})})();