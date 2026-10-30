document.documentElement.classList.add('js');

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
    const h=document.createElement('h3'); h.textContent=fam; box.appendChild(h);
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
    try{await navigator.clipboard.writeText(u.href);copied.textContent='Enlace copiado.';}
    catch(e){copied.textContent=u.href;}
  });
})();

/* ---------- navegación: sombra al bajar y menú en móvil ---------- */
(function(){
  const nav=document.getElementById('nav'); if(!nav) return;
  addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>8),{passive:true});
  const btn=document.getElementById('menuBtn'); if(!btn) return;
  const set=open=>{nav.classList.toggle('open',open);btn.setAttribute('aria-expanded',open);btn.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');};
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

  /* ---------- MADRE: limbo en relieve con tres bandas y trono calado ---------- */
  const mater=document.getElementById('mater');
  el('path',{d:ring(404,470),class:'limb','fill-rule':'evenodd'},mater);
  el('circle',{r:470,class:'bold'},mater);
  el('circle',{r:466,class:'ln2'},mater);
  el('circle',{r:452,class:'ln2'},mater);
  el('circle',{r:434,class:'ln2'},mater);
  el('circle',{r:404,class:'ln'},mater);
  // escala de grados: 1° corto, 5° medio, 15° hasta el borde de la banda
  for(let i=0;i<360;i++){
    const a=i-90, long=i%15===0, mid=i%5===0, [x1,y1]=pt(466,a), [x2,y2]=pt(long?452:mid?456:460,a);
    el('line',{x1:f(x1),y1:f(y1),x2:f(x2),y2:f(y2),class:long||mid?'ln':'ln2'},mater);
  }
  // numeración de 5 en 5 por cuadrantes (5 … 90), como en los limbos medievales
  for(let i=5;i<=360;i+=5){
    const a=i, [x,y]=pt(443,a-90), q=((i-1)%90)+1, n=Math.ceil(q/5)*5;
    const t=el('text',{x:f(x),y:f(y),class:'num deg','text-anchor':'middle','dominant-baseline':'central',transform:`rotate(${a} ${f(x)} ${f(y)})`},mater);
    t.textContent=n;
  }
  // horas: veinticuatro casillas con su numeral romano
  const roman=['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'];
  for(let h=0;h<24;h++){
    const a=h*15, [x,y]=pt(419,a-90), [d1x,d1y]=pt(434,a-90+7.5), [d2x,d2y]=pt(404,a-90+7.5);
    el('line',{x1:f(d1x),y1:f(d1y),x2:f(d2x),y2:f(d2y),class:'ln2'},mater);
    const t=el('text',{x:f(x),y:f(y),class:'num','text-anchor':'middle','dominant-baseline':'central',transform:`rotate(${a} ${f(x)} ${f(y)})`},mater);
    t.textContent=roman[h%12];
  }
  // trono (kursi): pieza calada simétrica con lóbulos, apoyada en el limbo
  {
    const half='C150 -480 122 -502 96 -500 C114 -526 96 -552 70 -546 C82 -572 56 -594 34 -586 C40 -604 18 -616 0 -616';
    const mir=half.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g,(m,x,_,y)=>`${-x} ${y}`);
    // el lado izquierdo se recorre al revés para cerrar el contorno
    const segs=mir.split('C').slice(1).map(sg=>sg.trim().split(' ').map(Number));
    let back='',prev=[0,-616];
    const ptsL=[[-150,-445]];segs.forEach(sg=>ptsL.push([sg[4],sg[5]]));
    for(let i=segs.length-1;i>=0;i--){const sg=segs[i],to=ptsL[i];back+=` C${sg[2]} ${sg[3]} ${sg[0]} ${sg[1]} ${to[0]} ${to[1]}`;}
    const holes='M62 -488 C50 -508 66 -530 82 -520 C94 -510 84 -490 62 -488 Z M-62 -488 C-50 -508 -66 -530 -82 -520 C-94 -510 -84 -490 -62 -488 Z '+
      'M0 -540 C-14 -556 -12 -578 0 -588 C12 -578 14 -556 0 -540 Z M40 -548 a7 7 0 1 0 0.01 0 Z M-40 -548 a7 7 0 1 0 0.01 0 Z '+
      'M24 -500 C14 -514 26 -528 38 -520 C44 -512 38 -500 24 -500 Z M-24 -500 C-14 -514 -26 -528 -38 -520 C-44 -512 -38 -500 -24 -500 Z';
    el('path',{d:`M150 -445 ${half}${back} A470 470 0 0 1 150 -445 Z ${holes}`,class:'metal','fill-rule':'evenodd'},mater);
    el('path',{d:'M110 -462 C96 -476 74 -474 66 -462 M-110 -462 C-96 -476 -74 -474 -66 -462 M0 -490 L0 -528',class:'ln2'},mater);
    // grillete y anilla de suspensión
    el('path',{d:'M-10 -612 L-10 -630 C-10 -642 10 -642 10 -630 L10 -612',class:'bold'},mater);
    el('circle',{cy:-658,r:22,class:'bold'},mater);
    el('circle',{cy:-658,r:15,class:'ln2'},mater);
  }

  /* ---------- LÁMINA: almucantarates, acimuts, horas desiguales y crepúsculo ---------- */
  const plate=document.getElementById('plate');
  const defs=el('defs',{},document.getElementById('astro'));
  const cpPlate=el('clipPath',{id:'cpPlate'},defs); el('circle',{r:R},cpPlate);
  el('circle',{r:R,class:'ln'},plate);
  el('circle',{r:k,class:'ln2'},plate);
  el('circle',{r:rCan,class:'ln2'},plate);
  const g=el('g',{'clip-path':'url(#cpPlate)'},plate);
  const alm=a=>{const ys=-k*Math.tan(rad((180-PHI-a)/2)), yn=k*Math.tan(rad((PHI-a)/2));return {cy:(ys+yn)/2,r:Math.abs(yn-ys)/2};};
  for(let a=0;a<=84;a+=6){const c=alm(a);el('circle',{cy:f(c.cy),r:f(c.r),class:a===0?'ln':'ln3'},g);}
  {const c=alm(-18);el('circle',{cy:f(c.cy),r:f(c.r),class:'ln3 dash'},g);}   // crepúsculo astronómico
  const hz=alm(0);
  const cpH=el('clipPath',{id:'cpH'},defs); el('circle',{cy:f(hz.cy),r:f(hz.r)},cpH);
  const ga=el('g',{'clip-path':'url(#cpH)'},g);
  const yz=-k*Math.tan(rad((90-PHI)/2)), yn=k*Math.tan(rad((90+PHI)/2)), ym=(yz+yn)/2, D2=(yn-yz)/2;
  for(let A=15;A<180;A+=15){
    if(A===90){el('line',{x1:-R,y1:f(ym),x2:R,y2:f(ym),class:'ln3'},ga);continue;}
    const xc=D2/Math.tan(rad(A)), rr=Math.hypot(xc,D2);
    el('circle',{cx:f(xc),cy:f(ym),r:f(rr),class:'ln3'},ga);
    el('circle',{cx:f(-xc),cy:f(ym),r:f(rr),class:'ln3'},ga);
  }
  // horas desiguales: el arco de cada trópico y del ecuador bajo el horizonte se divide en doce
  {
    const below=r=>{const yI=(hz.cy*hz.cy-hz.r*hz.r+r*r)/(2*hz.cy), xI=Math.sqrt(Math.max(0,r*r-yI*yI)), a0=Math.atan2(yI,xI);return {r,a0,span:Math.PI-2*a0};};
    const C=[below(R),below(k),below(rCan)];
    for(let h=1;h<12;h++){
      const P=C.map(c=>{const a=c.a0+c.span*h/12;return [c.r*Math.cos(a),c.r*Math.sin(a)];});
      el('path',{d:arc3(P[0],P[1],P[2]),class:'ln3 hrs'},g);
    }
  }
  el('line',{x1:0,y1:-R,x2:0,y2:R,class:'ln2'},g);
  el('line',{x1:-R,y1:0,x2:R,y2:0,class:'ln3'},g);
  el('circle',{cy:f(yz),r:3,class:'solid'},g);

  /* ---------- ARAÑA: pieza calada con anillos, eclíptica, zodiaco y punteros unidos por tracería ---------- */
  const reteRot=document.getElementById('rete');
  const rete=el('g',{},reteRot);
  const ecC=-(R-rCan)/2, ecR=(R+rCan)/2, band=26;   // la eclíptica es tangente a Capricornio y a Cáncer
  const RC=R-6, RQ=k;                               // anillo de Capricornio y anillo del ecuador
  el('path',{d:ring(R-12,R),class:'metal','fill-rule':'evenodd'},rete);
  el('path',{d:ring(k-3.5,k+3.5),class:'metal','fill-rule':'evenodd'},rete);
  el('path',{d:ring(ecR-band,ecR,ecC),class:'metal','fill-rule':'evenodd'},rete);
  el('path',{d:ring(26,40),class:'metal','fill-rule':'evenodd'},rete);   // buje central
  // barras en cruz entre el buje y el anillo exterior
  el('path',{d:`M${-R+10} -5 H-38 V5 H${-R+10} Z M${R-10} -5 H38 V5 H${R-10} Z M-5 38 V${R-10} H5 V38 Z M-5 ${f(ecC-ecR+band)} V-38 H5 V${f(ecC-ecR+band)} Z`,class:'metal'},rete);
  // de longitud eclíptica a posición proyectada
  const ecl=l=>{const L=rad(l),e=rad(EPS);const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L));const dec=Math.asin(Math.sin(e)*Math.sin(L));return pt(rDec(deg(dec)),deg(ra));};
  for(let l=0;l<360;l+=2){
    const [x,y]=ecl(l), dx=x, dy=y-ecC, d=Math.hypot(dx,dy), ux=dx/d, uy=dy/d;
    const len=l%30===0?band:l%10===0?11:6;
    el('line',{x1:f(x),y1:f(y),x2:f(x-ux*len),y2:f(y-uy*len),class:l%30===0?'ln':'ln2'},rete);
  }
  const signs=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpius','Sagittarius','Capricornus','Aquarius','Pisces'];
  signs.forEach((s,i)=>{
    const [x,y]=ecl(i*30+15), dx=x, dy=y-ecC, d=Math.hypot(dx,dy), ux=dx/d, uy=dy/d;
    const tx=x-ux*(band*0.62), ty=y-uy*(band*0.62), ang=deg(Math.atan2(uy,ux))+90;
    const t=el('text',{x:f(tx),y:f(ty),'text-anchor':'middle','dominant-baseline':'central','font-size':12.5,transform:`rotate(${f(ang)} ${f(tx)} ${f(ty)})`},rete);
    t.textContent=s;
  });
  // estrellas brillantes: ascensión recta y declinación reales
  const STARS=[['Aldebaran',69.0,16.5],['Rigel',78.6,-8.2],['Capella',79.2,46.0],['Betelgeuse',88.8,7.4],['Sirius',101.3,-16.7],['Procyon',114.8,5.2],['Pollux',116.3,28.0],['Alphard',141.9,-8.7],['Regulus',152.1,12.0],['Dubhe',165.9,61.8],['Denebola',177.3,14.6],['Spica',201.3,-11.2],['Alkaid',206.9,49.3],['Arcturus',213.9,19.2],['Vega',279.2,38.8],['Altair',297.7,8.9],['Deneb',310.4,45.3],['Markab',346.2,15.2],['Alpheratz',2.1,29.1],['Algol',47.0,40.9]];
  const stars=[];
  const tracery=el('g',{},rete);   // tallos por debajo de los punteros
  STARS.forEach(([n,ra,dec])=>{
    const r=rDec(dec), [x,y]=pt(r,ra), ux=x/r, uy=y/r, nx=-uy, ny=ux;
    // el puntero crece hacia el anillo más cercano (buje, ecuador o Capricornio) y se une a él con un tallo curvo
    const target=[40,RQ,R-12].reduce((b,v)=>Math.abs(v-r)<Math.abs(b-r)?v:b);
    const dir=Math.sign(target-r)||1, gap=Math.abs(target-r);
    const L=Math.max(18,Math.min(44,gap-6)), bx=x+ux*L*dir, by=y+uy*L*dir, mx=x+ux*L*.5*dir, my=y+uy*L*.5*dir;
    const side=(Math.round(ra)%2?1:-1);
    if(gap>L+2){
      const ex=ux*target, ey=uy*target, qx=(bx+ex)/2+nx*14*side, qy=(by+ey)/2+ny*14*side;
      el('path',{d:`M${f(bx)} ${f(by)} Q${f(qx)} ${f(qy)} ${f(ex)} ${f(ey)}`,class:'stem'},tracery);
      el('circle',{cx:f(ex+nx*6*side),cy:f(ey+ny*6*side),r:4.5,class:'metal'},tracery);   // voluta en la unión
    }
    el('path',{d:`M${f(bx+nx*5)} ${f(by+ny*5)} Q${f(mx+nx*11)} ${f(my+ny*11)} ${f(x)} ${f(y)} Q${f(mx-nx*1)} ${f(my-ny*1)} ${f(bx-nx*5)} ${f(by-ny*5)} Q${f(bx-nx*12+ux*8*dir)} ${f(by-ny*12+uy*8*dir)} ${f(bx+nx*5)} ${f(by+ny*5)} Z`,class:'metal'},rete);
    const dot=el('circle',{cx:f(x),cy:f(y),r:3.4,class:'star'},rete);
    const lx=x+nx*14-ux*6*dir, ly=y+ny*14-uy*6*dir;
    const t=el('text',{x:f(lx),y:f(ly),class:'lbl','dominant-baseline':'central','text-anchor':nx>=0?'start':'end'},rete);
    t.textContent=n;
    stars.push({n,ra,dec,dot,t});
  });

  /* ---------- REGLA: dos brazos tangentes al buje, con escala de declinación ---------- */
  const rule=document.getElementById('rule');
  const RL=452, RW=16;
  el('path',{d:`M0 ${-RW} L${RL} ${-RW} L${RL-14} 0 L${RW} 0 A${RW} ${RW} 0 0 1 0 ${RW} L${-RL} ${RW} L${-RL+14} 0 L${-RW} 0 A${RW} ${RW} 0 0 1 0 ${-RW} Z`,style:'fill:rgba(228,224,215,.30);stroke:rgba(244,241,234,.85);stroke-width:1.4'},rule);
  for(let d=-20;d<=60;d+=2){const r=rDec(d);if(r<RW+6||r>RL-20)continue;const big=d%10===0;el('line',{x1:f(r),y1:0,x2:f(r),y2:f(big?-RW+2:-8),style:`stroke:rgba(17,18,20,${big?.9:.6});stroke-width:${big?1.4:1}`},rule);}
  el('line',{x1:RW,y1:0,x2:RL-14,y2:0,style:'stroke:rgba(244,241,234,.9);stroke-width:1'},rule);
  el('line',{x1:-RL+14,y1:0,x2:-RW,y2:0,style:'stroke:rgba(244,241,234,.9);stroke-width:1'},rule);

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
  const es=v=>v.toFixed(1).replace('.',',');
  const annM=document.getElementById('annM'), annMn=document.getElementById('annMn'), annMd=document.getElementById('annMd');
  let reteA=0, ruleA=-38, targetRule=-38, last=performance.now(), active=null;
  const lessons=[...document.querySelectorAll('#lessons > li')];
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
      annRa.textContent=`Regla a ${es(ang)}°`;
      annDec.textContent=`Declinación ${active.dec>0?'+':'−'}${es(Math.abs(active.dec))}°`;
      ann.setAttribute('opacity','1');
      if(annMn.textContent!==active.n) annMn.textContent=active.n;
      annMd.textContent=`Regla ${es(ang)}° · Dec. ${active.dec>0?'+':'−'}${es(Math.abs(active.dec))}°`;
      annM.style.opacity='1';
    } else {ann.setAttribute('opacity','0');annM.style.opacity='0';}
    // el instrumento se retira cuando hay texto que leer
    const o=y<innerHeight*.5?1:.42; sky.style.setProperty('--sky-o',o);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- entradas ---------- */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.18,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv,#method').forEach(n=>io.observe(n));

  /* ---------- formulario ---------- */
  const form=document.getElementById('form');
  const need={nombre:'Escribe tu nombre.',org:'Indica tu organización.',email:'Necesitamos un correo para responderte.'};
  const sendErr=document.getElementById('e-send'), sendBtn=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async ev=>{
    ev.preventDefault(); let first=null; sendErr.textContent='';
    for(const id in need){
      const i=document.getElementById(id), box=i.closest('.f'), m=document.getElementById('e-'+id);
      let msg='';
      if(!i.value.trim()) msg=need[id];
      else if(id==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value.trim())) msg='Revisa el correo: falta la arroba o el dominio.';
      m.textContent=msg; box.classList.toggle('err',!!msg); i.setAttribute('aria-invalid',msg?'true':'false');
      if(msg&&!first) first=i;
    }
    if(first){first.focus();return;}
    const v=id=>document.getElementById(id).value.trim();
    const body=`Nombre: ${v('nombre')}\nOrganización: ${v('org')}\nCargo: ${v('cargo')}\nCorreo: ${v('email')}\nProblema: ${v('motivo')}\n\n${v('mensaje')}`;
    const subject='Solicitud de conversación: '+v('org'), to=form.dataset.mailto, endpoint=form.dataset.endpoint.trim();
    if(!endpoint){
      // sin servicio de formularios: se abre el correo con el mensaje preparado
      location.href=`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      form.classList.add('sent');
      return;
    }
    // con servicio de formularios (Formspree y similares aceptan este JSON)
    sendBtn.disabled=true; sendBtn.textContent='Enviando…';
    try{
      const data=Object.fromEntries(new FormData(form)); data._subject=subject;
      const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
      if(!res.ok) throw new Error(res.status);
      document.getElementById('okTitle').textContent='Solicitud enviada.';
      document.getElementById('okText').textContent='Gracias. Te respondemos en dos días laborables.';
      form.classList.add('sent');
    }catch(e){
      sendErr.innerHTML=`No se ha podido enviar. Inténtalo de nuevo o escríbenos a <a href="mailto:${to}">${to}</a>.`;
    }finally{
      sendBtn.disabled=false; sendBtn.textContent='Solicitar una conversación';
    }
  });
})();
