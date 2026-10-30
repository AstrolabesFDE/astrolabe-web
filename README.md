# astrolabe-web

Web de Astrolabes. HTML, CSS y JavaScript sin dependencias ni paso de compilación: se sirve tal cual desde cualquier hosting estático.

## Estructura

```
index.html           Página principal
privacidad.html      Política de privacidad (texto base, con huecos [ASÍ] por rellenar)
aviso-legal.html     Aviso legal (texto base, con huecos [ASÍ] por rellenar)
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

## Paleta

Casi negro y casi blanco, sin llegar a `#000` ni `#fff`:

| Uso | Color |
| --- | --- |
| Fondo | `#111214` |
| Fondo de sección | `#18191C` |
| Texto y acento | `#EDEAE3` / `#E4E0D7` |
| Texto secundario | `#B3B0A9` |
| Texto terciario | `#8B8882` |

Están definidos como variables al principio de `css/styles.css`.

## Símbolo (aún sin decidir)

El símbolo de la navegación, el pie y la pestaña se puede cambiar sin tocar código:

- En el pie: «Símbolo provisional: … cambiar» abre las veinte propuestas. La elección se aplica a toda la web y se recuerda en ese navegador.
- Con un enlace: `?simbolo=astro-3`, `?simbolo=a-6`, etc. El botón «Copiar enlace con este símbolo» lo genera.

Cuando esté decidido:

1. En `js/logos.js`, cambia `DEFAULT: 'astro-6'` por el elegido.
2. Pon `data-sym-picker="off"` en la etiqueta `<html>` de cada página para ocultar el selector.
3. Cambia el favicon (`<link rel="icon">`) al SVG correspondiente de `icons/`.

Los SVG de `icons/` usan `currentColor`: toman el color del texto donde se insertan. Abiertos solos se ven en negro.

## Formulario de contacto

Sin configurar nada, al enviar se abre el correo con el mensaje preparado para contacto@astrolabes.io.

Para que envíe directamente, crea un formulario en un servicio como Formspree y pega su URL en `data-endpoint` del `<form>` en `index.html`:

```html
<form id="form" … data-endpoint="https://formspree.io/f/XXXXXXX" …>
```

## Pendiente

- Datos de la empresa en privacidad y aviso legal.
- Versión en inglés.
- Elegir el símbolo definitivo.
- Publicar: GitHub Pages necesita que el repositorio sea público o un plan de pago; otra opción es Netlify o Cloudflare Pages conectados a este repositorio.
