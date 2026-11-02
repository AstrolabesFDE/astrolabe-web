# astrolabe-web

Web de Astrolabe. HTML, CSS y JavaScript sin dependencias ni paso de compilación: se sirve tal cual desde cualquier hosting estático.

## Estructura

```
index.html           Página principal
privacidad.html      Política de privacidad (texto base, con huecos [ASÍ] por rellenar)
aviso-legal.html     Aviso legal (texto base, con huecos [ASÍ] por rellenar)
en/                  Versión en inglés: index.html, privacy.html y legal-notice.html
css/styles.css       Estilos
js/logos.js          Las veinte propuestas de símbolo, dibujadas en código
js/main.js           Astrolabio de fondo, selector de símbolo, menú y formulario
icons/astrolabio/    Familia «Astro» en SVG (astro-1 … astro-10)
icons/a-con-mar/     Familia «A con mar» en SVG (a-1 … a-10)
```

## Ver la web en local

```bash
python3 -m http.server 8000
```

y abrir http://localhost:8000. También funciona abriendo `index.html` directamente.

## Temas de color

La web tiene dos temas, que se eligen con las muestras de la barra de navegación (en móvil, una sola muestra que va rotando). La elección se recuerda en el navegador.

| Tema | Fondo | Texto | Acento y astrolabio |
| --- | --- | --- | --- |
| Oscuro (por defecto) | `#111214` | `#EDEAE3` | `#E4E0D7` |
| Claro | `#F3F1EC` | `#141416` | `#1C1D20` |

Todos los colores, también los del astrolabio, son variables definidas al principio de `css/styles.css` para cada `data-theme`.

## Idiomas

Cada página tiene su equivalente en inglés dentro de `en/`, y el botón **EN / ES** de la barra (en móvil, dentro del menú) lleva de una a otra. Si cambias un texto en español, cambia también su versión en `en/`.

Los textos que genera el JavaScript (validación del formulario, lectura de la estrella, menú) están en el diccionario `TXT` al principio de `js/main.js` y se eligen según el `lang` de la página.

## Símbolo (aún sin decidir)

El símbolo de la navegación, el pie y la pestaña se puede cambiar sin tocar código:

- En el pie: «Símbolo provisional: … cambiar» abre las veinte propuestas. La elección se aplica a toda la web y se recuerda en ese navegador.
- Con un enlace: `?simbolo=astro-3`, `?simbolo=a-6`, etc. El botón «Copiar enlace con este símbolo» lo genera.

Cuando esté decidido:

1. En `js/logos.js`, cambia `DEFAULT: 'astro-6'` por el elegido.
2. Pon `data-sym-picker="off"` en la etiqueta `<html>` de cada página para ocultar el selector.
3. Cambia el favicon (`<link rel="icon">`) al SVG correspondiente de `icons/`.

Los SVG de `icons/` usan `currentColor`: toman el color del texto donde se insertan. Abiertos solos se ven en negro.

## Demos

La sección **Demos** tiene cuatro tarjetas con un marcador de «Próximamente». Para publicar una:

1. Guarda la captura o el gif en `assets/demos/` con el nombre que indica el comentario de cada tarjeta (`ontologia.gif`, `licitaciones.gif`, `competencia.gif`, `reputacion.gif`). Proporción recomendada 16:10.
2. En `index.html` (y en `en/index.html`), dentro de `<figure class="demo-media">`, sustituye el bloque `<div class="ph">…</div>` y la etiqueta `<span class="soon">` por la `<img>` del comentario.

## Esquema de sistemas

Los sistemas de la izquierda y los casos de uso de la derecha son listas normales en el HTML (`#flow`). Las líneas se dibujan solas: si añades o quitas un elemento, el JavaScript las recalcula.

## Formulario de contacto

Sin configurar nada, al enviar se abre el correo con el mensaje preparado para hello@astrolabes.io.

Para que envíe directamente, crea un formulario en un servicio como Formspree y pega su URL en `data-endpoint` del `<form>` en `index.html`:

```html
<form id="form" … data-endpoint="https://formspree.io/f/XXXXXXX" …>
```

## Pendiente

- Datos de la empresa en privacidad y aviso legal.
- Versión en inglés.
- Elegir el símbolo definitivo.
- Publicar: GitHub Pages necesita que el repositorio sea público o un plan de pago; otra opción es Netlify o Cloudflare Pages conectados a este repositorio.
