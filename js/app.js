/* Reservas de citas
   Sin dependencias. El estado vive en localStorage.
   Orden del archivo: 1) configuración, 2) almacenamiento, 3) validación,
   4) pantalla (render), 5) eventos.
*/
(function () {
  'use strict';

  /* ---------- 1. Configuración ---------- */
  const CLAVE_STORAGE = 'mostaza.reservas.v1';
  const SERVICIOS = [
    { id: 'asesoria',   nombre: 'Asesoría de marca' },
    { id: 'fotografia', nombre: 'Sesión fotográfica' },
    { id: 'web',        nombre: 'Diseño de página web' }
  ];
  const CAMPOS = ['nombre', 'correo', 'servicio', 'fecha', 'hora'];
  const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const el = {
    form: document.getElementById('form-reserva'),
    mensaje: document.getElementById('mensaje'),
    lista: document.getElementById('lista'),
    vacio: document.getElementById('vacio'),
    contador: document.getElementById('contador')
  };
  CAMPOS.forEach(function (c) {
    el[c] = document.getElementById(c);
    el['error-' + c] = document.getElementById('error-' + c);
  });

  let reservas = cargar();

  /* ---------- 2. Almacenamiento ---------- */
  // localStorage puede fallar (modo privado, cuota llena, datos dañados),
  // así que siempre va dentro de try/catch.
  function cargar() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
      return Array.isArray(datos) ? datos : [];
    } catch (e) {
      return [];
    }
  }

  function guardar(lista) {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false;
    }
  }

  function crearId() {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2);
  }

  /* ---------- 3. Fechas y validación ---------- */
  function dosDigitos(n) { return String(n).padStart(2, '0'); }

  // Fecha local en formato AAAA-MM-DD (toISOString usaría UTC y puede dar el día anterior).
  function fechaLocalISO(d) {
    return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
  }

  // Una cadena "AAAA-MM-DDTHH:MM" sin zona horaria se interpreta como hora local.
  function aFecha(fecha, hora) { return new Date(fecha + 'T' + hora); }

  function nombreServicio(id) {
    const s = SERVICIOS.find(function (x) { return x.id === id; });
    return s ? s.nombre : id;
  }

  function leerFormulario() {
    return {
      nombre: el.nombre.value.trim().replace(/\s+/g, ' '),
      correo: el.correo.value.trim().toLowerCase(),
      servicio: el.servicio.value,
      fecha: el.fecha.value,
      hora: el.hora.value
    };
  }

  // Devuelve un objeto { campo: 'mensaje' }. Si está vacío, los datos son válidos.
  function validar(d, existentes) {
    const errores = {};

    if (!d.nombre) errores.nombre = 'Escribe tu nombre.';
    else if (d.nombre.length < 2) errores.nombre = 'El nombre es demasiado corto.';

    if (!d.correo) errores.correo = 'Escribe tu correo electrónico.';
    else if (!REGEX_CORREO.test(d.correo)) errores.correo = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';

    if (!SERVICIOS.some(function (s) { return s.id === d.servicio; })) {
      errores.servicio = 'Selecciona un servicio.';
    }

    if (!d.fecha) errores.fecha = 'Elige una fecha.';
    if (!d.hora) errores.hora = 'Elige una hora.';

    if (d.fecha && d.hora) {
      const momento = aFecha(d.fecha, d.hora);
      if (isNaN(momento.getTime())) {
        errores.fecha = 'La fecha u hora no es válida.';
      } else if (d.fecha < fechaLocalISO(new Date())) {
        errores.fecha = 'No puedes reservar en una fecha que ya pasó.';
      } else if (momento < new Date()) {
        errores.hora = 'Esa hora ya pasó. Elige una hora posterior a la actual.';
      }
    }

    // Duplicado: mismo servicio, misma fecha y misma hora (sin importar el cliente).
    if (!errores.fecha && !errores.hora && !errores.servicio) {
      const repetida = existentes.some(function (r) {
        return r.servicio === d.servicio && r.fecha === d.fecha && r.hora === d.hora;
      });
      if (repetida) errores.hora = 'Ese servicio ya está reservado en esa fecha y hora. Elige otro horario.';
    }

    return errores;
  }

  /* ---------- 4. Pantalla ---------- */
  function mostrarErrores(errores) {
    let primero = null;
    CAMPOS.forEach(function (c) {
      const msg = errores[c] || '';
      el['error-' + c].textContent = msg;
      el[c].setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !primero) primero = el[c];
    });
    if (primero) primero.focus();
  }

  function mostrarMensaje(texto, tipo) {
    el.mensaje.textContent = texto;
    el.mensaje.className = 'mensaje ' + tipo;
    el.mensaje.hidden = false;
  }

  function formatearFecha(fecha) {
    return aFecha(fecha, '00:00').toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function formatearHora(fecha, hora) {
    return aFecha(fecha, hora).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  }

  // Se usa textContent (nunca innerHTML) para que un nombre como "<script>" se muestre como texto.
  function crearItem(r) {
    const li = document.createElement('li');
    li.className = 'reserva';

    const info = document.createElement('div');

    const titulo = document.createElement('h3');
    titulo.textContent = nombreServicio(r.servicio);

    const cuando = document.createElement('p');
    cuando.className = 'cuando';
    cuando.textContent = formatearFecha(r.fecha) + ', ' + formatearHora(r.fecha, r.hora);

    const quien = document.createElement('p');
    quien.className = 'quien';
    quien.textContent = r.nombre + ' (' + r.correo + ')';

    info.append(titulo, cuando, quien);

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton-cancelar';
    boton.textContent = 'Cancelar reserva';
    boton.setAttribute('aria-label', 'Cancelar la reserva de ' + r.nombre + ' para ' + nombreServicio(r.servicio));
    boton.addEventListener('click', function () { cancelar(r.id); });

    li.append(info, boton);
    return li;
  }

  function render() {
    // Orden cronológico: las más próximas primero.
    const ordenadas = reservas.slice().sort(function (a, b) {
      return (a.fecha + 'T' + a.hora).localeCompare(b.fecha + 'T' + b.hora);
    });
    el.lista.replaceChildren.apply(el.lista, ordenadas.map(crearItem));
    el.vacio.hidden = ordenadas.length > 0;
    el.contador.textContent = ordenadas.length ? '(' + ordenadas.length + ')' : '';
  }

  /* ---------- 5. Acciones y eventos ---------- */
  function confirmarReserva(evento) {
    evento.preventDefault();
    const datos = leerFormulario();
    const errores = validar(datos, reservas);
    mostrarErrores(errores);

    if (Object.keys(errores).length > 0) {
      mostrarMensaje('No se pudo confirmar la reserva. Revisa los campos marcados.', 'error');
      return;
    }

    const nueva = Object.assign({ id: crearId(), creada: new Date().toISOString() }, datos);
    const actualizadas = reservas.concat(nueva);

    if (!guardar(actualizadas)) {
      mostrarMensaje('No se pudo guardar la reserva en este navegador. Revisa que el almacenamiento esté habilitado.', 'error');
      return;
    }

    reservas = actualizadas;
    render();
    el.form.reset();
    mostrarMensaje(
      'Reserva confirmada: ' + nombreServicio(datos.servicio) + ' el ' + formatearFecha(datos.fecha) +
      ' a las ' + formatearHora(datos.fecha, datos.hora) + ', a nombre de ' + datos.nombre + '.',
      'ok'
    );
  }

  function cancelar(id) {
    const r = reservas.find(function (x) { return x.id === id; });
    if (!r) return;
    if (!window.confirm('¿Cancelar la reserva de ' + r.nombre + ' para ' + nombreServicio(r.servicio) + '?')) return;

    const actualizadas = reservas.filter(function (x) { return x.id !== id; });
    if (!guardar(actualizadas)) {
      mostrarMensaje('No se pudo cancelar la reserva. Intenta de nuevo.', 'error');
      return;
    }
    reservas = actualizadas;
    render();
    mostrarMensaje('Reserva cancelada.', 'info');
  }

  function iniciar() {
    // Llenar el selector desde la lista de servicios (una sola fuente de verdad).
    SERVICIOS.forEach(function (s) {
      const op = document.createElement('option');
      op.value = s.id;
      op.textContent = s.nombre;
      el.servicio.appendChild(op);
    });

    // El calendario no deja elegir días anteriores a hoy.
    el.fecha.min = fechaLocalISO(new Date());

    el.form.addEventListener('submit', confirmarReserva);

    // Al corregir un campo, se limpia su error.
    CAMPOS.forEach(function (c) {
      el[c].addEventListener('input', function () {
        el['error-' + c].textContent = '';
        el[c].setAttribute('aria-invalid', 'false');
      });
    });

    // Si se cambia algo desde otra pestaña, esta se actualiza.
    window.addEventListener('storage', function (e) {
      if (e.key === CLAVE_STORAGE) { reservas = cargar(); render(); }
    });

    render();
  }

  iniciar();
})();
