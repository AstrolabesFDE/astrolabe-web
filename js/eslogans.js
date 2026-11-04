/* Eslóganes candidatos para el hero (mientras no esté decidido).
   Cada uno: t1 y t2 son las dos líneas del titular (t2 va en gris) y sub es el subtítulo.
   Se cambia desde la píldora «Eslogan» del hero, desde el pie o con ?eslogan=3.
   Para fijar uno: cambia DEFAULT y pon data-eslogan-picker="off" en <html>. */
(function () {
  const LIST = [
    { t1: 'Hacemos que Foundry funcione', t2: 'de verdad en tu empresa.', sub: 'Fuimos clientes durante cinco años. Conocemos el problema porque lo sufrimos y la solución porque la construimos.' },
    { t1: 'Conocemos el problema porque lo sufrimos.', t2: 'Conocemos la solución porque la construimos.', sub: 'Fuimos clientes de Foundry durante cinco años. Ahora te ayudamos a sacarle el valor que a nosotros nos costó encontrar.' },
    { t1: 'Cinco años desplegando Foundry', t2: 'desde dentro.', sub: 'Ahora ponemos esa experiencia al servicio de tu empresa, sobre el terreno.' },
    { t1: 'No vendemos humo.', t2: 'Bajamos al barro.', sub: 'Ontología, casos de uso y automatización que tu equipo usa cada día.' },
    { t1: 'Menos estrategia en PowerPoint.', t2: 'Más ingeniería sobre el terreno.', sub: 'Conectamos tus sistemas, construimos tus casos de uso y automatizamos tu operación desde dentro.' },
    { t1: 'Nos manchamos las manos.', t2: 'Tú ves los resultados.', sub: 'Nos integramos en tu equipo y hacemos la parte difícil hasta que el impacto se mide en tu negocio.' },
    { t1: 'Hacemos que Foundry funcione', t2: 'de verdad en tu empresa.', sub: 'Del despliegue a la adopción real, con impacto en tus métricas de negocio.' },
    { t1: 'Convertimos tu inversión en Foundry', t2: 'en resultados de negocio.', sub: 'Casos de uso que se usan, operaciones que se automatizan y decisiones que se aceleran.' },
    { t1: 'Que la inversión se note', t2: 'en la operación.', sub: 'Bajamos al barro hasta que el cambio se ve en tus métricas.' },
    { t1: 'Tus sistemas conectados. Tu operativa automatizada.', t2: 'Tus decisiones aceleradas.', sub: 'Unimos tus datos en una ontología que trabaja para tu negocio.' },
    { t1: 'Datos conectados, operación automatizada,', t2: 'decisiones más rápidas.', sub: 'Así es como Foundry empieza a rendir en tu empresa.' },
    { t1: 'Tu piloto de IA funcionó.', t2: '¿Y ahora qué?', sub: 'Se acabaron las demos glorificadas. Ponemos la IA a trabajar en tu operación de verdad.' },
    { t1: 'Tu operación,', t2: 'transformada de verdad.', sub: 'Nos quedamos sobre el terreno hasta que el cambio es real y se mide.' },
    { t1: 'Tecnología que tu equipo usa', t2: 'y que mueve tu negocio.', sub: 'Bajamos al barro hasta que el impacto se nota.' }
  ];
  const DEFAULT = 0;

  const h1 = document.getElementById('h-hero'), lead = document.querySelector('.hero .lead');
  if (!h1 || !lead) return;
  const KEY = 'astrolabes-eslogan';
  const store = { get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} } };
  const pickerOn = document.documentElement.dataset.esloganPicker !== 'off';
  const valid = v => { const n = parseInt(v, 10); return n >= 1 && n <= LIST.length ? n - 1 : null; };
  const fromUrl = valid(new URLSearchParams(location.search).get('eslogan'));
  let current = pickerOn ? (fromUrl ?? valid(store.get()) ?? DEFAULT) : DEFAULT;

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pill = document.getElementById('esloganPill'), dlg = document.getElementById('eslo'), box = document.getElementById('esloList');

  function apply(i, animate) {
    current = (i + LIST.length) % LIST.length; const s = LIST[current];
    if (animate) h1.closest('.hero').classList.add('swap');
    h1.innerHTML = `<span class="line"><span>${esc(s.t1)}</span></span><span class="line l2"><span>${esc(s.t2)}</span></span>`;
    lead.textContent = s.sub;
    document.querySelectorAll('[data-eslo-current]').forEach(n => { n.textContent = `${current + 1} / ${LIST.length}`; });
    if (box) box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.i === current ? 'true' : 'false'));
  }
  function pick(i) { apply(i, true); store.set(String(current + 1)); }
  apply(current, false);
  if (!pickerOn) return;

  if (box) LIST.forEach((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i;
    b.innerHTML = `<span class="eslo-n">${String(i + 1).padStart(2, '0')}</span><span class="eslo-t"><b>${esc(s.t1)} <i>${esc(s.t2)}</i></b><small>${esc(s.sub)}</small></span>`;
    b.addEventListener('click', () => { pick(i); dlg.close(); h1.scrollIntoView({ block: 'center' }); });
    box.appendChild(b);
  });
  apply(current, false);

  if (pill) {
    pill.hidden = false;
    pill.querySelector('[data-eslo-prev]').addEventListener('click', () => pick(current - 1));
    pill.querySelector('[data-eslo-next]').addEventListener('click', () => pick(current + 1));
  }
  document.querySelectorAll('[data-eslo-ui]').forEach(n => n.hidden = false);
  document.querySelectorAll('[data-eslo-open]').forEach(b => b.addEventListener('click', () => dlg.showModal()));
  if (!dlg) return;
  dlg.querySelector('[data-eslo-close]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  const copied = document.getElementById('esloCopied');
  dlg.querySelector('[data-eslo-copy]').addEventListener('click', async () => {
    const u = new URL(location.href); u.searchParams.set('eslogan', current + 1); u.hash = '';
    try { await navigator.clipboard.writeText(u.href); copied.textContent = 'Enlace copiado.'; }
    catch (e) { copied.textContent = u.href; }
  });
})();
