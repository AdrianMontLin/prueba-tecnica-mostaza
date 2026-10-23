# Reserva de citas | Prueba técnica Mostaza

Página para registrar reservas de citas, hecha con HTML, CSS y JavaScript sin dependencias. Los datos se guardan en `localStorage`, así que permanecen al recargar.

## Cómo ejecutarla

1. Descarga o clona el repositorio.
2. Abre `index.html` con doble clic en cualquier navegador moderno o  en la consola de comandos usar `python3 -m http.server 8000`.

## Qué hace

- Registra nombre, correo, servicio (3 opciones), fecha y hora, con botón de confirmar y mensaje de confirmación.
- Valida campos obligatorios y formato de correo.
- Impide fechas y horas anteriores al momento actual.
- Impide duplicados: mismo servicio, fecha y hora.
- Lista las reservas en orden cronológico y permite cancelarlas.
- Se adapta a computador y celular.

## Estructura

```
index.html        Estructura de la página
css/styles.css    Estilos (mobile first, variables de color)
js/app.js         Lógica: configuración, almacenamiento, validación, pantalla y eventos
docs/             Respuestas a los casos y plantilla de organización de sitios
```

## Decisiones

- Los datos de cada reserva se muestran con `textContent`, no con `innerHTML`, para evitar inyección de HTML.
- La fecha de "hoy" se calcula en hora local, no en UTC, para no fallar en la noche.
- El acceso a `localStorage` va en `try/catch`: si falla (modo privado, datos dañados), la página avisa o arranca vacía.

## Límites conocidos

- Los datos viven solo en el navegador de cada persona: no hay disponibilidad compartida entre clientes.
- No se envía correo de confirmación (fuera del alcance de la prueba).
- La duplicidad se revisa por hora exacta, no por duración del servicio.
