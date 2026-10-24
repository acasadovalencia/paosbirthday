# Cumple Pao 35 ✦

Landing de invitación para el cumpleaños de Pao. Cada invitado confirma su asistencia por WhatsApp.

**Sábado 28 de noviembre · 19:30 h · Pez Gato Music Bar (Calle Pez 40, Malasaña)**

## Estructura

```
cumple-pao-35/
├── index.html              Página
├── css/styles.css          Estilos (móvil primero, escritorio a partir de 980 px)
├── js/liquid.js            Fondo líquido animado (WebGL, con degradado de respaldo)
├── js/main.js              Formulario → mensaje de WhatsApp
└── assets/
    ├── img/globos-35.*     Foto de los globos (portada)
    ├── img/pao.*           Foto de Pao con el viraje de color
    ├── img/preview.jpg     Imagen de vista previa al compartir el enlace
    ├── cumple-pao-35.ics   Evento para "Añadir al calendario"
    └── favicon.svg
```

Es HTML, CSS y JS sin dependencias ni proceso de build.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub, por ejemplo `cumple-pao-35`, y márcalo como **Public**.
2. Sube todo el contenido de esta carpeta a la raíz del repositorio. `index.html` tiene que quedar en la raíz.
   - Desde la web: **Add file › Upload files**, arrastra los archivos y carpetas y pulsa **Commit changes**.
3. Ve a **Settings › Pages**. En *Build and deployment* elige:
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)** y pulsa **Save**.
4. En uno o dos minutos la web estará en `https://TU-USUARIO.github.io/cumple-pao-35/`.

## Vista previa en WhatsApp

Para que al pegar el enlace salga la imagen de la portada, cambia en `index.html` esta línea:

```html
<meta property="og:image" content="assets/img/preview.jpg">
```

por la URL completa:

```html
<meta property="og:image" content="https://TU-USUARIO.github.io/cumple-pao-35/assets/img/preview.jpg">
```

WhatsApp guarda en caché la vista previa. Si ya habías pegado el enlace antes del cambio, prueba a añadir `?v=2` al final del enlace.

## Cambiar el teléfono o los mensajes

Todo está al principio de `js/main.js`, en `CONFIG`:

- `phone`: número con prefijo de país, sin `+` ni espacios. Ahora mismo es `34675057062`.
- `messages.yes` / `messages.no`: texto que se envía según la respuesta.
- `messages.note`: cómo se añade el mensaje opcional del invitado.

## Probar en local

Abre `index.html` en el navegador. Si el calendario o las fuentes no cargan bien desde el archivo, sirve la carpeta:

```bash
python3 -m http.server 8000
```

y entra en `http://localhost:8000`.
