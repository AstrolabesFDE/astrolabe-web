/* Alternativas de diseño: lo que no hace js/main.js */

/* frase que se ilumina palabra a palabra al cruzar la línea de lectura */
(function(){
  const blocks=document.querySelectorAll('[data-reveal]'); if(!blocks.length) return;
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  blocks.forEach(p=>{
    const words=p.textContent.trim().split(/\s+/);
    p.innerHTML=words.map(w=>`<span class="wd">${w}</span>`).join(' ');
  });
  const spans=[...document.querySelectorAll('[data-reveal] .wd')];
  if(still){spans.forEach(s=>s.classList.add('on'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}}),{rootMargin:'0px 0px -42% 0px'});
  spans.forEach(s=>io.observe(s));
})();

/* enlace de la barra que corresponde a la sección visible */
(function(){
  const links=[...document.querySelectorAll('.nav-links a[href^="#"]')]; if(!links.length) return;
  const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting) return;
    links.forEach(a=>{a.classList.remove('on');a.removeAttribute('aria-current');});
    const a=map.get(e.target.id); if(a){a.classList.add('on');a.setAttribute('aria-current','true');}
  }),{rootMargin:'-45% 0px -50% 0px'});
  map.forEach((_,id)=>{const s=document.getElementById(id); if(s) io.observe(s);});
})();
