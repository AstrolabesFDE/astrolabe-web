document.documentElement.classList.add('js');

/* ---------- textos de la interfaz en el idioma de la página (lang="es" o lang="en") ---------- */
const LANG=(document.documentElement.lang||'es').startsWith('en')?'en':'es';
const TXT={
  es:{copied:'Enlace copiado.',menuOpen:'Abrir menú',menuClose:'Cerrar menú',ruleAt:'Regla a',rule:'Regla',dec:'Declinación',decS:'Dec.',
      needName:'Escribe tu nombre.',needOrg:'Indica tu organización.',needEmail:'Necesitamos un correo para responderte.',badEmail:'Revisa el correo: falta la arroba o el dominio.',
      lName:'Nombre',lOrg:'Organización',lRole:'Cargo',lEmail:'Correo',lInterest:'Interés',subject:'Solicitud de conversación: ',
      sending:'Enviando…',send:'Enviar',sentT:'Solicitud enviada.',sentP:'Gracias. Te respondemos en dos días laborables.',
      fail:'No se ha podido enviar. Inténtalo de nuevo o escríbenos a',fam:{'Astrolabio':'Astrolabio','A con mar':'A con mar'}},
  en:{copied:'Link copied.',menuOpen:'Open menu',menuClose:'Close menu',ruleAt:'Rule at',rule:'Rule',dec:'Declination',decS:'Dec.',
      needName:'Please enter your name.',needOrg:'Please enter your organisation.',needEmail:'We need an email address to reply.',badEmail:'Please check the email address: it’s missing an @ or a domain.',
      lName:'Name',lOrg:'Organisation',lRole:'Role',lEmail:'Email',lInterest:'Interest',subject:'Conversation request: ',
      sending:'Sending…',send:'Send',sentT:'Request sent.',sentP:'Thank you. We will reply within two working days.',
      fail:'We couldn’t send it. Please try again or write to us at',fam:{'Astrolabio':'Astrolabe','A con mar':'A with sea'}}
}[LANG];

/* ---------- símbolo: se puede cambiar mientras no esté decidido ---------- */
(function(){
  const L=window.AstrolabesLogos; if(!L) return;
  const KEY='astrolabes-simbolo';
  const store={get(){try{return localStorage.getItem(KEY);}catch(e){return null;}},set(v){try{localStorage.setItem(KEY,v);}catch(e){}}};
  const fromUrl=new URLSearchParams(location.search).get('simbolo');
  const pickerOn=document.documentElement.dataset.symPicker!=='off';
  let current=L.get((pickerOn&&(fromUrl||store.get()))||L.DEFAULT).id;

  const favicon=document.querySelector('link[rel="icon"]');
  function apply(id){
    current=L.get(id).id; const logo=L.get(current);
    document.querySelectorAll('[data-logo]').forEach(n=>{n.innerHTML=logo.svg();});
    document.querySelectorAll('[data-sym-current]').forEach(n=>{n.textContent=logo.code;});
    document.querySelectorAll('#symFamilies button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===current?'true':'false'));
    if(favicon){
      const svg=logo.svg().replace(/currentColor/g,'#111214');
      favicon.href='data:image/svg+xml,'+encodeURIComponent(svg);
    }
  }
  apply(current);
  if(!pickerOn) return;

  // catálogo dentro del diálogo, agrupado por familia
  const box=document.getElementById('symFamilies'), dlg=document.getElementById('sym');
  if(!box||!dlg) return;
  [...new Set(L.list.map(l=>l.family))].forEach(fam=>{
    const h=document.createElement('h3'); h.textContent=TXT.fam[fam]||fam; box.appendChild(h);
    const grid=document.createElement('div'); grid.className='sym-grid'; box.appendChild(grid);
    L.list.filter(l=>l.family===fam).forEach(l=>{
      const b=document.createElement('button'); b.type='button'; b.dataset.id=l.id;
      b.innerHTML=`${l.svg()}<b>${l.code}</b><span>${l.name}</span>`;
      b.addEventListener('click',()=>{apply(l.id);store.set(l.id);});
      grid.appendChild(b);
    });
  });
  apply(current);
  document.querySelectorAll('[data-sym-ui]').forEach(n=>n.hidden=false);
  document.querySelectorAll('[data-sym-open]').forEach(b=>b.addEventListener('click',()=>dlg.showModal()));
  dlg.querySelector('[data-sym-close]').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
  const copied=document.getElementById('symCopied');
  dlg.querySelector('[data-sym-copy]').addEventListener('click',async()=>{
    const u=new URL(location.href); u.searchParams.set('simbolo',current); u.hash='';
    try{await navigator.clipboard.writeText(u.href);copied.textContent=TXT.copied;}
    catch(e){copied.textContent=u.href;}
  });
})();

/* ---------- principios: marca el activo en la columna fija ---------- */
(function(){
  const links=[...document.querySelectorAll('.pr-nav a')]; if(!links.length) return;
  const set=id=>links.forEach(a=>{const on=a.dataset.for===id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
    if(on&&a.parentElement.scrollWidth>a.parentElement.clientWidth)a.parentElement.scrollTo({left:a.offsetLeft-24,behavior:'smooth'});});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)set(e.target.id);}),{rootMargin:'-40% 0px -55% 0px'});
  document.querySelectorAll('.pillar').forEach(p=>io.observe(p));
  set(links[0].dataset.for);
})();

/* ---------- formas de trabajar: el botón deja elegida la opción en el formulario ---------- */
(function(){
  const sel=document.getElementById('motivo'); if(!sel) return;
  document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>{sel.value=a.dataset.pick;}));
})();

/* ---------- tema: oscuro o claro; se recuerda en este navegador ---------- */
(function(){
  const KEY='astrolabes-tema', ORDER=['dark','light'], META={dark:'#111214',light:'#F3F1EC'};
  const btns=[...document.querySelectorAll('[data-theme-set]')]; if(!btns.length) return;
  const meta=document.querySelector('meta[name="theme-color"]'), narrow=matchMedia('(max-width:640px)');
  const apply=(t,save)=>{
    if(!ORDER.includes(t)) t='dark';
    document.documentElement.dataset.theme=t;
    btns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.themeSet===t?'true':'false'));
    if(meta) meta.content=META[t];
    if(save){try{localStorage.setItem(KEY,t);}catch(e){}}
  };
  apply(document.documentElement.dataset.theme||'dark',false);
  btns.forEach(b=>b.addEventListener('click',()=>{
    const cur=document.documentElement.dataset.theme;
    // en móvil solo se ve la muestra activa: cada toque pasa al tema siguiente
    const next=narrow.matches&&b.dataset.themeSet===cur?ORDER[(ORDER.indexOf(cur)+1)%ORDER.length]:b.dataset.themeSet;
    apply(next,true);
    if(narrow.matches) document.querySelector(`[data-theme-set="${next}"]`).focus();
  }));
})();

/* ---------- esquema: líneas entre cada sistema, Astrolabes y cada caso de uso ---------- */
(function(){
  const fig=document.getElementById('flow'), svg=document.getElementById('wires'); if(!fig||!svg) return;
  const NS='http://www.w3.org/2000/svg', still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hub=fig.querySelector('[data-wire="hub"]'), ai=fig.querySelector('[data-wire="ai"]'), hubCol=fig.querySelector('.col-hub');
  const srcs=[...fig.querySelectorAll('[data-wire="src"] .tile')], outs=[...fig.querySelectorAll('[data-wire="out"]')];
  const f=v=>v.toFixed(1);
  function draw(){
    const R=fig.getBoundingClientRect(), H=hub.getBoundingClientRect(), vertical=getComputedStyle(fig).gridTemplateColumns.split(' ').length<3;
    const box=e=>{const r=e.getBoundingClientRect();return {l:r.left-R.left,r:r.right-R.left,t:r.top-R.top,b:r.bottom-R.top,cx:(r.left+r.right)/2-R.left,cy:(r.top+r.bottom)/2-R.top};};
    const h=box(hub); svg.setAttribute('viewBox',`0 0 ${f(R.width)} ${f(R.height)}`); svg.innerHTML='';
    const curve=(x1,y1,x2,y2)=>vertical?`M${f(x1)} ${f(y1)} C${f(x1)} ${f((y1+y2)/2)} ${f(x2)} ${f((y1+y2)/2)} ${f(x2)} ${f(y2)}`:`M${f(x1)} ${f(y1)} C${f((x1+x2)/2)} ${f(y1)} ${f((x1+x2)/2)} ${f(y2)} ${f(x2)} ${f(y2)}`;
    const add=(d,i,node)=>{
      const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('class','wire');svg.appendChild(p);
      if(!still){const c=document.createElementNS(NS,'circle');c.setAttribute('r','2.4');c.setAttribute('class','pulse');
        const m=document.createElementNS(NS,'animateMotion');m.setAttribute('dur','2.6s');m.setAttribute('begin',`${(i*0.37)%2.6}s`);m.setAttribute('repeatCount','indefinite');m.setAttribute('path',d);c.appendChild(m);svg.appendChild(c);}
      const li=node.closest('li')||node;li.onmouseenter=()=>p.classList.add('hot');li.onmouseleave=()=>p.classList.remove('hot');
    };
    srcs.forEach((t,i)=>{const s=box(t), spread=(i-(srcs.length-1)/2)*(vertical?10:9);
      vertical?add(curve(s.cx,s.b,h.cx+spread,h.t),i,t):add(curve(s.r,s.cy,h.l,h.cy+spread),i,t);});
    // en vertical los casos de uso salen de la capa de IA, que queda justo debajo de Astrolabes
    const a=ai?box(ai):null, from=vertical&&a?{cx:a.cx,b:a.b}:{cx:h.cx,b:h.b};
    if(a){const c=box(hubCol);add(`M${f(c.cx)} ${f(c.b+6)} L${f(a.cx)} ${f(a.t)}`,srcs.length+outs.length,ai);}
    outs.forEach((o,i)=>{const s=box(o), spread=(i-(outs.length-1)/2)*(vertical?10:9);
      vertical?add(curve(from.cx+spread,from.b,s.cx,s.t),i+srcs.length,o):add(curve(h.r,h.cy+spread,s.l,s.cy),i+srcs.length,o);});
  }
  let raf=0; const redraw=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);};
  draw(); addEventListener('resize',redraw); addEventListener('load',redraw);
  if(document.fonts) document.fonts.ready.then(redraw);
  if('ResizeObserver' in window) new ResizeObserver(redraw).observe(fig);
})();

/* ---------- demos: flechas del carrusel ---------- */
(function(){
  const track=document.getElementById('demoTrack'); if(!track) return;
  document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>{
    const card=track.querySelector('.demo'); const step=card?card.getBoundingClientRect().width+24:400;
    track.scrollBy({left:step*Number(b.dataset.demo),behavior:'smooth'});
  }));
})();

/* ---------- frase que se ilumina palabra a palabra al cruzar la línea de lectura ---------- */
(function(){
  const blocks=document.querySelectorAll('[data-reveal]'); if(!blocks.length) return;
  blocks.forEach(p=>{p.innerHTML=p.textContent.trim().split(/\s+/).map(w=>`<span class="wd">${w}</span>`).join(' ');});
  const spans=[...document.querySelectorAll('[data-reveal] .wd')];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){spans.forEach(s=>s.classList.add('on'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}}),{rootMargin:'0px 0px -42% 0px'});
  spans.forEach(s=>io.observe(s));
})();

/* ---------- navegación: sombra al bajar y menú en móvil ---------- */
(function(){
  const nav=document.getElementById('nav'); if(!nav) return;
  addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>8),{passive:true});
  const btn=document.getElementById('menuBtn'); if(!btn) return;
  const set=open=>{nav.classList.toggle('open',open);btn.setAttribute('aria-expanded',open);btn.setAttribute('aria-label',open?TXT.menuClose:TXT.menuOpen);};
  btn.addEventListener('click',()=>set(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>set(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){set(false);btn.focus();}});
})();

(function(){
  if(!document.getElementById('astro')) return;
  const NS='http://www.w3.org/2000/svg';
  const el=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;};
  const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI, f=v=>(+v).toFixed(2);
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- geometría real: proyección estereográfica desde el polo sur ---------- */
  const R=400, EPS=23.44, PHI=40.4;          // borde de la lámina = trópico de Capricornio; latitud de Madrid
  const k=R/Math.tan(rad((90+EPS)/2));       // radio del ecuador
  const rDec=d=>k*Math.tan(rad((90-d)/2));   // radio proyectado de una declinación
  const rCan=rDec(EPS);
  const pt=(r,a)=>[r*Math.cos(rad(a)), r*Math.sin(rad(a))];

  // anillo relleno entre dos radios (pieza de metal calada)
  const ring=(r1,r2,cy=0)=>`M${f(r2)} ${f(cy)} a${f(r2)} ${f(r2)} 0 1 0 ${f(-2*r2)} 0 a${f(r2)} ${f(r2)} 0 1 0 ${f(2*r2)} 0 Z M${f(r1)} ${f(cy)} a${f(r1)} ${f(r1)} 0 1 1 ${f(-2*r1)} 0 a${f(r1)} ${f(r1)} 0 1 1 ${f(2*r1)} 0 Z`;
  // arco que pasa por tres puntos, muestreado como polilínea (así no depende de los flags de arco)
  const arc3=(P1,P2,P3,n=28)=>{
    const ax=P1[0],ay=P1[1],bx=P2[0],by=P2[1],cx=P3[0],cy=P3[1];
    const d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
    if(Math.abs(d)<1e-6) return `M${f(ax)} ${f(ay)} L${f(cx)} ${f(cy)}`;
    const ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/d;
    const uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/d;
    const r=Math.hypot(ax-ux,ay-uy), A=Math.atan2(ay-uy,ax-ux), B=Math.atan2(by-uy,bx-ux), C=Math.atan2(cy-uy,cx-ux);
    const TAU=2*Math.PI, norm=v=>((v%TAU)+TAU)%TAU;
    let span=norm(C-A); if(norm(B-A)>span) span=span-TAU;   // sentido que pasa por el punto medio
    let out='';for(let i=0;i<=n;i++){const t=A+span*i/n;out+=(i?' L':'M')+f(ux+r*Math.cos(t))+' '+f(uy+r*Math.sin(t));}
    return out;
  };

  // numeración del limbo por cuadrantes (5 … 90) y horas en números romanos
  const quad=n=>n%90||90, ROM=['I','II','III','IIII','V','VI','VII','VIII','IX','X','XI','XII'];
  const rivet=(x,y,parent)=>{el('circle',{cx:f(x),cy:f(y),r:5.2,class:'rivet'},parent);el('circle',{cx:f(x-1.4),cy:f(y-1.6),r:1.5,class:'glint'},parent);};

  /* ---------- MADRE: limbo con escala de grados numerada por cuadrantes, trono de arabescos ---------- */
  const mater=document.getElementById('mater');
  el('path',{d:ring(404,470),class:'limb','fill-rule':'evenodd'},mater);
  el('circle',{r:470,class:'bold'},mater);
  el('circle',{r:466,class:'ln2'},mater);
  el('circle',{r:450,class:'ln2'},mater);
  el('circle',{r:418,class:'ln2'},mater);
  el('circle',{r:404,class:'ln'},mater);
  for(let i=0;i<360;i++){
    const a=i-90, long=i%5===0, [x1,y1]=pt(466,a), [x2,y2]=pt(long?450:458,a);
    el('line',{x1:f(x1),y1:f(y1),x2:f(x2),y2:f(y2),class:long?'ln':'ln2'},mater);
  }
  for(let i=0;i<360;i+=5){   // banda interior: marcas de 5° con un punto cada 15°
    const a=i-90, [x1,y1]=pt(418,a), [x2,y2]=pt(i%15===0?404:412,a);
    el('line',{x1:f(x1),y1:f(y1),x2:f(x2),y2:f(y2),class:'ln2'},mater);
  }
  for(let i=5;i<=360;i+=5){
    const [x,y]=pt(434,i-90);
    const t=el('text',{x:f(x),y:f(y),class:'num limbn','text-anchor':'middle','dominant-baseline':'central',transform:`rotate(${i} ${f(x)} ${f(y)})`},mater);
    t.textContent=quad(i);
  }
  // trono (kursi): contorno lobulado, calados en arabesco y un filete grabado por dentro
  {
    const half='C150 -480 122 -502 96 -500 C114 -526 96 -552 70 -546 C82 -572 56 -594 34 -586 C40 -604 18 -616 0 -616';
    const segs=half.split('C').slice(1).map(sg=>sg.trim().split(' ').map(Number).map((v,i)=>i%2?v:-v));
    const ptsL=[[-150,-445]];segs.forEach(sg=>ptsL.push([sg[4],sg[5]]));
    let back='';for(let i=segs.length-1;i>=0;i--){const sg=segs[i],to=ptsL[i];back+=` C${sg[2]} ${sg[3]} ${sg[0]} ${sg[1]} ${to[0]} ${to[1]}`;}
    const outline=`M150 -445 ${half}${back} A470 470 0 0 1 150 -445 Z`;
    const tear=(x,y,s,m)=>`M${x} ${y} C${x-12*s*m} ${y-20*s} ${x+4*s*m} ${y-42*s} ${x+20*s*m} ${y-32*s} C${x+32*s*m} ${y-22*s} ${x+22*s*m} ${y-2*s} ${x} ${y} Z`;
    const holes=[tear(62,-484,1,1),tear(-62,-484,1,-1),tear(26,-498,.8,1),tear(-26,-498,.8,-1),tear(104,-470,.6,1),tear(-104,-470,.6,-1),
      'M0 -536 C-16 -554 -14 -580 0 -592 C14 -580 16 -554 0 -536 Z',
      'M42 -552 a7 7 0 1 0 0.01 0 Z M-42 -552 a7 7 0 1 0 0.01 0 Z M0 -604 a4 4 0 1 0 0.01 0 Z'].join(' ');
    el('path',{d:`${outline} ${holes}`,class:'metal','fill-rule':'evenodd'},mater);
    el('path',{d:outline,class:'ln2',fill:'none',transform:'translate(0 -470) scale(.9) translate(0 470)'},mater);
    el('path',{d:'M0 -500 L0 -530 M-128 -458 C-118 -476 -96 -480 -84 -470 M128 -458 C118 -476 96 -480 84 -470',class:'ln2'},mater);
    el('path',{d:'M-10 -612 L-10 -630 C-10 -642 10 -642 10 -630 L10 -612',class:'bold'},mater);
    el('circle',{cy:-658,r:22,class:'bold'},mater);
    el('circle',{cy:-658,r:15,class:'ln2'},mater);
    rivet(0,-622,mater);
  }

  /* ---------- LÁMINA: almucantarates cada 3°, acimuts cada 10°, horas desiguales y crepúsculo ---------- */
  const plate=document.getElementById('plate');
  const defs=el('defs',{},document.getElementById('astro'));
  const cpPlate=el('clipPath',{id:'cpPlate'},defs); el('circle',{r:R},cpPlate);
  el('circle',{r:R,class:'ln'},plate);
  el('circle',{r:k,class:'ln2'},plate);
  el('circle',{r:rCan,class:'ln2'},plate);
  const g=el('g',{'clip-path':'url(#cpPlate)'},plate);
  const alm=a=>{const ys=-k*Math.tan(rad((180-PHI-a)/2)), yn=k*Math.tan(rad((PHI-a)/2));return {cy:(ys+yn)/2,r:Math.abs(yn-ys)/2,yn};};
  for(let a=0;a<=87;a+=3){const c=alm(a);el('circle',{cy:f(c.cy),r:f(c.r),class:a===0?'ln':a%6?'ln4':'ln3'},g);
    if(a&&a%12===0){const t=el('text',{x:5,y:f(c.yn-3),class:'num small'},g);t.textContent=a;}}
  {const c=alm(-18);el('circle',{cy:f(c.cy),r:f(c.r),class:'ln3 dash'},g);}
  const hz=alm(0);
  const cpH=el('clipPath',{id:'cpH'},defs); el('circle',{cy:f(hz.cy),r:f(hz.r)},cpH);
  const ga=el('g',{'clip-path':'url(#cpH)'},g);
  const yz=-k*Math.tan(rad((90-PHI)/2)), yn=k*Math.tan(rad((90+PHI)/2)), ym=(yz+yn)/2, D2=(yn-yz)/2;
  for(let A=10;A<180;A+=10){
    if(A===90){el('line',{x1:-R,y1:f(ym),x2:R,y2:f(ym),class:'ln3'},ga);continue;}
    const xc=D2/Math.tan(rad(A)), rr=Math.hypot(xc,D2);
    el('circle',{cx:f(xc),cy:f(ym),r:f(rr),class:A%30?'ln4':'ln3'},ga);
    el('circle',{cx:f(-xc),cy:f(ym),r:f(rr),class:A%30?'ln4':'ln3'},ga);
  }
  {
    const below=r=>{const yI=(hz.cy*hz.cy-hz.r*hz.r+r*r)/(2*hz.cy), xI=Math.sqrt(Math.max(0,r*r-yI*yI)), a0=Math.atan2(yI,xI);return {r,a0,span:Math.PI-2*a0};};
    const C=[below(R),below(k),below(rCan)];
    for(let h=1;h<12;h++){
      const P=C.map(c=>{const a=c.a0+c.span*h/12;return [c.r*Math.cos(a),c.r*Math.sin(a)];});
      el('path',{d:arc3(P[0],P[1],P[2]),class:'ln3 hrs'},g);
      const a=C[0].a0+C[0].span*(h-.5)/12, [tx,ty]=[(R-14)*Math.cos(a),(R-14)*Math.sin(a)];
      const t=el('text',{x:f(tx),y:f(ty),class:'num small','text-anchor':'middle','dominant-baseline':'central'},g);t.textContent=ROM[h-1];
    }
  }
  el('line',{x1:0,y1:-R,x2:0,y2:R,class:'ln2'},g);
  el('line',{x1:-R,y1:0,x2:R,y2:0,class:'ln3'},g);
  el('circle',{cy:f(yz),r:3,class:'solid'},g);

  /* ---------- ARAÑA: tracería árabe con punteros en daga, zarcillos, remaches e inscripciones ---------- */
  const reteRot=document.getElementById('rete');
  const rete=el('g',{},reteRot);
  const ecC=-(R-rCan)/2, ecR=(R+rCan)/2, band=26;   // la eclíptica es tangente a Capricornio y a Cáncer
  const tracery=el('g',{},rete), body=el('g',{},rete);
  // ribete: cinta de metal con borde grabado (dos trazos superpuestos)
  const ribbon=(d,w=7)=>{el('path',{d,class:'rib-o','stroke-width':w},tracery);el('path',{d,class:'rib-i','stroke-width':w-2.6},tracery);};
  el('path',{d:ring(R-12,R),class:'metal','fill-rule':'evenodd'},body);
  // arco del ecuador en la mitad inferior, como en las arañas árabes
  {const a1=14,a2=166,[x1,y1]=pt(k+4,a1),[x2,y2]=pt(k+4,a2),[x3,y3]=pt(k-4,a2),[x4,y4]=pt(k-4,a1);
   el('path',{d:`M${f(x1)} ${f(y1)} A${f(k+4)} ${f(k+4)} 0 0 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${f(k-4)} ${f(k-4)} 0 0 0 ${f(x4)} ${f(y4)} Z`,class:'metal'},body);
   rivet(...pt(k,a1),body);rivet(...pt(k,a2),body);}
  el('path',{d:ring(ecR-band,ecR,ecC),class:'metal','fill-rule':'evenodd'},body);
  el('circle',{cy:f(ecC),r:f(ecR-band+4),class:'ln2',fill:'none'},body);
  el('circle',{cy:f(ecC),r:f(ecR-4),class:'ln2',fill:'none'},body);
  el('path',{d:ring(26,42),class:'metal','fill-rule':'evenodd'},body);
  el('circle',{r:34,class:'ln2',fill:'none'},body);
  // barra horizontal escalonada y barra vertical
  const step=s=>`M${s*42} -5 H${s*104} V-10 H${s*132} V-5 H${s*(R-10)} V5 H${s*132} V10 H${s*104} V5 H${s*42} Z`;
  el('path',{d:`${step(1)} ${step(-1)} M-5 42 V${R-10} H5 V42 Z M-5 ${f(ecC-ecR+band)} V-42 H5 V${f(ecC-ecR+band)} Z`,class:'metal'},body);
  [[R-6,0],[-(R-6),0],[0,R-6],[0,f(ecC-ecR+3)]].forEach(([x,y])=>rivet(+x,+y,body));
  // zarcillos que salen del buje como rayos de sol
  for(let i=0;i<10;i++){
    const a=i*36+18, [ux,uy]=pt(1,a), nx=-uy, ny=ux, s=i%2?1:-1;
    const P=r=>[ux*r,uy*r], [b1x,b1y]=P(42), [tx,ty]=P(112);
    el('path',{d:`M${f(b1x+nx*6)} ${f(b1y+ny*6)} C${f(ux*70+nx*(6+14*s))} ${f(uy*70+ny*(6+14*s))} ${f(ux*96-nx*10*s)} ${f(uy*96-ny*10*s)} ${f(tx)} ${f(ty)} C${f(ux*92-nx*4*s)} ${f(uy*92-ny*4*s)} ${f(ux*66+nx*(-6+8*s))} ${f(uy*66+ny*(-6+8*s))} ${f(b1x-nx*6)} ${f(b1y-ny*6)} Z`,class:'metal'},body);
  }
  // de longitud eclíptica a posición proyectada
  const ecl=l=>{const L=rad(l),e=rad(EPS);const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L));const dec=Math.asin(Math.sin(e)*Math.sin(L));return pt(rDec(deg(dec)),deg(ra));};
  for(let l=0;l<360;l+=2){
    const [x,y]=ecl(l), dx=x, dy=y-ecC, d=Math.hypot(dx,dy), ux=dx/d, uy=dy/d;
    const len=l%30===0?band:l%10===0?9:5;
    el('line',{x1:f(x),y1:f(y),x2:f(x-ux*len),y2:f(y-uy*len),class:l%30===0?'ln':'ln2'},body);
  }
  const signs=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpius','Sagittarius','Capricornus','Aquarius','Pisces'];
  signs.forEach((s,i)=>{
    const [x,y]=ecl(i*30+15), dx=x, dy=y-ecC, d=Math.hypot(dx,dy), ux=dx/d, uy=dy/d;
    const tx=x-ux*(band*0.6), ty=y-uy*(band*0.6), ang=deg(Math.atan2(uy,ux))+90;
    const t=el('text',{x:f(tx),y:f(ty),'text-anchor':'middle','dominant-baseline':'central','font-size':13,transform:`rotate(${f(ang)} ${f(tx)} ${f(ty)})`},body);
    t.textContent=s;
  });
  // estrellas brillantes: ascensión recta, declinación (el nombre árabe de origen queda como referencia)
  const STARS=[['Aldebaran',69.0,16.5,'الدبران'],['Rigel',78.6,-8.2,'رجل الجبار'],['Capella',79.2,46.0,'العيوق'],['Betelgeuse',88.8,7.4,'يد الجوزاء'],['Sirius',101.3,-16.7,'الشعرى'],['Procyon',114.8,5.2,'الغميصاء'],['Pollux',116.3,28.0,'رأس التوأم'],['Alphard',141.9,-8.7,'الفرد'],['Regulus',152.1,12.0,'قلب الأسد'],['Dubhe',165.9,61.8,'الدب'],['Denebola',177.3,14.6,'ذنب الأسد'],['Spica',201.3,-11.2,'السماك الأعزل'],['Alkaid',206.9,49.3,'القائد'],['Arcturus',213.9,19.2,'السماك الرامح'],['Vega',279.2,38.8,'النسر الواقع'],['Altair',297.7,8.9,'النسر الطائر'],['Deneb',310.4,45.3,'ذنب الدجاجة'],['Markab',346.2,15.2,'منكب الفرس'],['Alpheratz',2.1,29.1,'سرة الفرس'],['Algol',47.0,40.9,'رأس الغول']];
  const stars=[];
  const onEq=a=>{const v=((a%360)+360)%360;return v>=18&&v<=162;};
  STARS.forEach(([n,ra,dec,ar])=>{
    const r=rDec(dec), [x,y]=pt(r,ra), ux=x/r, uy=y/r, nx=-uy, ny=ux;
    // el puntero crece hacia la pieza más cercana (buje, ecuador o Capricornio) y se une a ella con una cinta curva
    const targets=[42,R-12].concat(onEq(ra)?[k]:[]);
    const target=targets.reduce((b,v)=>Math.abs(v-r)<Math.abs(b-r)?v:b);
    const dir=Math.sign(target-r)||1, gap=Math.abs(target-r);
    const L=Math.max(20,Math.min(40,gap-10)), dx=ux*dir, dy=uy*dir;
    const bx=x+dx*L, by=y+dy*L, side=(Math.round(ra)%2?1:-1);
    if(gap>L+4){
      const ex=ux*target, ey=uy*target, g2=gap-L;
      ribbon(`M${f(bx)} ${f(by)} C${f(bx+dx*g2*.45+nx*18*side)} ${f(by+dy*g2*.45+ny*18*side)} ${f(ex-dx*g2*.35-nx*14*side)} ${f(ey-dy*g2*.35-ny*14*side)} ${f(ex)} ${f(ey)}`);
      // hoja que brota del tallo
      const mx=(bx+ex)/2+nx*10*side, my=(by+ey)/2+ny*10*side;
      el('path',{d:`M${f(mx)} ${f(my)} q${f(nx*16*side+dx*4)} ${f(ny*16*side+dy*4)} ${f(nx*22*side-dx*8)} ${f(ny*22*side-dy*8)} q${f(-nx*10*side-dx*2)} ${f(-ny*10*side-dy*2)} ${f(-nx*22*side+dx*8)} ${f(-ny*22*side+dy*8)} Z`,class:'metal'},tracery);
    }
    // daga curvada con bola en la base y un ojo calado
    el('path',{d:`M${f(x)} ${f(y)} Q${f(x+dx*L*.45+nx*12*side)} ${f(y+dy*L*.45+ny*12*side)} ${f(bx+nx*6.5)} ${f(by+ny*6.5)} L${f(bx-nx*6.5)} ${f(by-ny*6.5)} Q${f(x+dx*L*.55+nx*2*side)} ${f(y+dy*L*.55+ny*2*side)} ${f(x)} ${f(y)} Z`,class:'metal'},body);
    el('circle',{cx:f(bx),cy:f(by),r:7,class:'metal'},body);
    el('circle',{cx:f(bx),cy:f(by),r:2.4,class:'eye'},body);
    const dot=el('circle',{cx:f(x),cy:f(y),r:3.2,class:'star'},body);
    const lx=x+nx*13*side-dx*4, ly=y+ny*13*side-dy*4;
    const t=el('text',{x:f(lx),y:f(ly),class:'lbl','dominant-baseline':'central','text-anchor':(nx*side)>=0?'start':'end'},body);
    t.textContent=n;
    stars.push({n,ra,dec,dot,t});
  });

  /* ---------- REGLA: dos brazos tangentes al buje, con escala de declinación ---------- */
  const rule=document.getElementById('rule');
  const RL=452, RW=16;
  el('path',{d:`M0 ${-RW} L${RL} ${-RW} L${RL-14} 0 L${RW} 0 A${RW} ${RW} 0 0 1 0 ${RW} L${-RL} ${RW} L${-RL+14} 0 L${-RW} 0 A${RW} ${RW} 0 0 1 0 ${-RW} Z`,style:'fill:rgba(var(--astro-rgb),.30);stroke:rgba(var(--astro2-rgb),.85);stroke-width:1.4'},rule);
  for(let d=-20;d<=60;d+=2){const r=rDec(d);if(r<RW+6||r>RL-20)continue;const big=d%10===0;el('line',{x1:f(r),y1:0,x2:f(r),y2:f(big?-RW+2:-8),style:`stroke:rgba(var(--ground-rgb),${big?.9:.6});stroke-width:${big?1.4:1}`},rule);}
  el('line',{x1:RW,y1:0,x2:RL-14,y2:0,style:'stroke:rgba(var(--astro2-rgb),.9);stroke-width:1'},rule);
  el('line',{x1:-RL+14,y1:0,x2:-RW,y2:0,style:'stroke:rgba(var(--astro2-rgb),.9);stroke-width:1'},rule);

  /* ---------- PASADOR Y «CABALLO»: la cuña que sujeta todas las piezas ---------- */
  {
    const inst=document.getElementById('inst'), pin=inst.lastElementChild;
    const horse=el('g',{class:'layer l-rule'},null);
    el('path',{d:'M34 -5 L-26 -5 C-34 -6 -40 -14 -48 -12 C-56 -10 -56 -1 -50 2 L-42 5 L34 5 Z',class:'metal'},horse);
    el('circle',{cx:-46,cy:-6,r:1.8,class:'solid'},horse);
    inst.insertBefore(horse,pin);
  }

  /* ---------- movimiento: la araña gira con el cielo, la regla con la lectura ---------- */
  const sky=document.querySelector('.sky svg'), ann=document.getElementById('ann'), annLd=document.getElementById('annLd'), annNm=document.getElementById('annNm'), annRa=document.getElementById('annRa'), annDec=document.getElementById('annDec');
  const es=v=>LANG==='es'?v.toFixed(1).replace('.',','):v.toFixed(1);
  const annM=document.getElementById('annM'), annMn=document.getElementById('annMn'), annMd=document.getElementById('annMd');
  let reteA=0, ruleA=-38, targetRule=-38, last=performance.now(), active=null;
  const lessons=[...document.querySelectorAll('#lessons > [data-star]')];
  function starAngle(name){const s=stars.find(s=>s.n===name);return s.ra+reteA;}
  function frame(now){
    const dt=Math.min(64,now-last); last=now;
    if(!reduce) reteA=(reteA+dt*0.0042)%360;      // una vuelta cada ~24 minutos de pantalla, perceptible pero calmada
    // la regla sigue al scroll; en "Lo que sabemos" apunta a la estrella de cada lección
    const y=window.scrollY, H=document.documentElement.scrollHeight-innerHeight;
    let tgt=-38+(y/H)*300, pick=null;
    for(const li of lessons){const r=li.getBoundingClientRect();if(r.top<innerHeight*.55&&r.bottom>innerHeight*.35){pick=li.dataset.star;}}
    if(y<innerHeight*.45) pick='Deneb';   // en el hero la regla siempre arranca leyendo una estrella
    if(pick){tgt=starAngle(pick);}
    // camino más corto
    let diff=((tgt-ruleA)%360+540)%360-180;
    ruleA+=reduce?diff:diff*Math.min(1,dt*0.0045);
    reteRot.setAttribute('transform',`rotate(${f(reteA)})`);
    rule.setAttribute('transform',`rotate(${f(ruleA)})`);
    // estrella más cercana al borde de la regla (en cualquiera de los dos brazos)
    let best=null,bd=99;
    for(const s of stars){let d=Math.abs((((s.ra+reteA)-ruleA)%360+540)%360-180);d=Math.min(d,180-d);if(d<bd){bd=d;best=s;}}
    if(best!==active){if(active){active.dot.classList.remove('on');active.t.classList.remove('on');}active=bd<4?best:null;if(active){active.dot.classList.add('on');active.t.classList.add('on');}}
    // lectura junto al instrumento: anillo sobre la estrella, guía y nombre a la izquierda
    if(active){
      const a=active.ra+reteA, r=rDec(active.dec), sx=r*Math.cos(rad(a)), sy=r*Math.sin(rad(a));
      const ex=sx-150, ey=sy-70, ang=((ruleA%360)+360)%360;
      ann.setAttribute('transform',`translate(${f(sx)} ${f(sy)})`);
      annLd.setAttribute('x1',f(-24*0.92));annLd.setAttribute('y1',f(-24*0.4));annLd.setAttribute('x2',f(ex-sx));annLd.setAttribute('y2',f(ey-sy));
      annNm.setAttribute('x',f(ex-sx-10));annNm.setAttribute('y',f(ey-sy-14));annNm.setAttribute('text-anchor','end');
      annRa.setAttribute('x',f(ex-sx-10));annRa.setAttribute('y',f(ey-sy+20));annRa.setAttribute('text-anchor','end');
      annDec.setAttribute('x',f(ex-sx-10));annDec.setAttribute('y',f(ey-sy+47));annDec.setAttribute('text-anchor','end');
      if(annNm.textContent!==active.n){annNm.textContent=active.n;}
      annRa.textContent=`${TXT.ruleAt} ${es(ang)}°`;
      annDec.textContent=`${TXT.dec} ${active.dec>0?'+':'−'}${es(Math.abs(active.dec))}°`;
      ann.setAttribute('opacity','1');
      if(annMn.textContent!==active.n) annMn.textContent=active.n;
      annMd.textContent=`${TXT.rule} ${es(ang)}° · ${TXT.decS} ${active.dec>0?'+':'−'}${es(Math.abs(active.dec))}°`;
      annM.style.opacity='1';
    } else {ann.setAttribute('opacity','0');annM.style.opacity='0';}
    // el instrumento se retira cuando hay texto que leer
    const o=y<innerHeight*.5?1:.42; sky.style.setProperty('--sky-o',o);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- entradas ---------- */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.18,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv,#method,.pillar,.onto,.step').forEach(n=>io.observe(n));

  /* ---------- formulario ---------- */
  const form=document.getElementById('form');
  const need={nombre:TXT.needName,org:TXT.needOrg,email:TXT.needEmail};
  const sendErr=document.getElementById('e-send'), sendBtn=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async ev=>{
    ev.preventDefault(); let first=null; sendErr.textContent='';
    for(const id in need){
      const i=document.getElementById(id), box=i.closest('.f'), m=document.getElementById('e-'+id);
      let msg='';
      if(!i.value.trim()) msg=need[id];
      else if(id==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value.trim())) msg=TXT.badEmail;
      m.textContent=msg; box.classList.toggle('err',!!msg); i.setAttribute('aria-invalid',msg?'true':'false');
      if(msg&&!first) first=i;
    }
    if(first){first.focus();return;}
    const v=id=>document.getElementById(id).value.trim();
    const body=`${TXT.lName}: ${v('nombre')}\n${TXT.lOrg}: ${v('org')}\n${TXT.lRole}: ${v('cargo')}\n${TXT.lEmail}: ${v('email')}\n${TXT.lInterest}: ${v('motivo')}\n\n${v('mensaje')}`;
    const subject=TXT.subject+v('org'), to=form.dataset.mailto, endpoint=form.dataset.endpoint.trim();
    if(!endpoint){
      // sin servicio de formularios: se abre el correo con el mensaje preparado
      location.href=`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      form.classList.add('sent');
      return;
    }
    // con servicio de formularios (Formspree y similares aceptan este JSON)
    sendBtn.disabled=true; sendBtn.textContent=TXT.sending;
    try{
      const data=Object.fromEntries(new FormData(form)); data._subject=subject;
      const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
      if(!res.ok) throw new Error(res.status);
      document.getElementById('okTitle').textContent=TXT.sentT;
      document.getElementById('okText').textContent=TXT.sentP;
      form.classList.add('sent');
    }catch(e){
      sendErr.innerHTML=`${TXT.fail} <a href="mailto:${to}">${to}</a>.`;
    }finally{
      sendBtn.disabled=false; sendBtn.textContent=TXT.send;
    }
  });
})();
