# Respuestas | Prueba técnica Mostaza

## 2. Resolución de problemas web

### A. WordPress dejó de funcionar tras actualizar un plugin

**Antes de cualquier acción:** hago una copia de los archivos y de la base de datos, aunque el sitio esté caído (snapshot del hosting o exportación desde phpMyAdmin). Si hay pedidos formularios nuevos desde el último respaldo, esa copia es la única que los tiene.

**Diagnóstico**
1. Identifico el síntoma: si es pantalla blanca, si muestra algún tipo de error, un mensaje de error crítico o solo falla el panel.
2. Reviso el registro de errores del hosting y, si hace falta, activo `WP_DEBUG` y `WP_DEBUG_LOG` en `wp-config.php` para leer `wp-content/debug.log`. Busco el nombre del plugin y el archivo que falla.
3. Confirmo la causa: La versión de PHP incompatible o conflicto con otro plugin.

**Recuperación**
1. Si entro a `wp-admin`, desactivo el plugin desde allí.
2. Si no entro, renombro la carpeta del plugin en `wp-content/plugins/` por SFTP o el administrador de archivos. (WordPress lo desactiva solo).
3. Verifico que el sitio vuelva: portada, páginas clave, formularios, inicio de sesión y compras si las hay.
4. Si el plugin es necesario, reinstalo la versión anterior (zip anterior o un plugin de reversión) y lo dejo sin actualizar hasta probar la nueva versión en un sitio de pruebas.
5. Si la causa no es el plugin, restauro el respaldo, pero antes exporto la base de datos actual para no perder datos nuevos.

**Después:** documento qué falló y por qué, aviso al cliente y, de ahora en adelante, actualizo con respaldo previo, de a un plugin por vez y primero en pruebas.

### B. Migración de una página a otro proveedor

**Información que solicitaría**
- Plataforma y versiones (WordPress, PHP, MySQL) y tamaño del sitio.
- Dónde está registrado el dominio y quién administra el DNS.
- Dónde está el correo del dominio. Es lo que más se rompe: si usa el hosting actual, hay que conservar los registros MX.
- Certificado SSL, tareas programadas, redirecciones e integraciones (formularios, pagos, CDN).
- Acceso al hosting actual y al nuevo, entregado por un canal seguro.
- Horario de menor tráfico y quién aprueba el cambio.

**Pasos**
1. Hago un inventario y capturas del sitio actual para comparar después.
2. 24 a 48 horas antes, bajo el TTL del DNS (por ejemplo, a 300 segundos).
3. Hago un respaldo completo (archivos y base de datos).
4. Monto el sitio en el nuevo proveedor y ajusto `wp-config.php` y las URLs.
5. Pruebo sin cambiar el DNS (archivo `hosts` local o URL temporal).
6. Congelo cambios de contenido, sincronizo lo nuevo y apunto el DNS al nuevo proveedor (sin tocar MX si el correo no se migra).
7. Activo SSL. Mantengo el hosting anterior entre 7 y 15 días como respaldo y plan de reversa: volver el DNS al servidor viejo.

**Verificación:** comparo con las capturas; reviso enlaces rotos, formularios, envío de correos, HTTPS, redirecciones, velocidad y la propagación del DNS (`nslookup` o `dig`). Dejo monitoreo de disponibilidad unos días.

### C. WordPress con 20 plugins

**Antes:** respaldo completo y, si es posible, una copia en entorno de pruebas. No retiro ni actualizo nada en producción sin eso.

**Inventario:** lista de cada plugin con su función, si está activo, versión instalada, versión disponible y fecha de la última actualización del autor.

**Criterios**

| Decisión | Cuándo |
|---|---|
| Mantener | Cumple una función necesaria y el autor lo mantiene al día |
| Actualizar | Es necesario y tiene versión pendiente. Lo hago en pruebas, uno por uno, dejando para el final los más delicados (tienda, constructores de páginas) |
| Retirar | Está inactivo, sin uso real, duplica a otro, está abandonado (más de un año sin actualizarse o sin compatibilidad con la versión actual de WordPress) o tiene una vulnerabilidad conocida sin corrección |

**Cómo compruebo si se usa:** busco sus shortcodes y bloques en el contenido, widgets y ajustes; luego lo desactivo en pruebas y reviso el sitio. Si nada se rompe, lo elimino (no solo lo desactivo, porque un plugin inactivo también puede tener vulnerabilidades). Compruebo vulnerabilidades en bases públicas como WPScan o Patchstack.

**Después:** registro cada decisión en la bitácora y reviso el sitio completo.

---

## 3. Organización de sitios web

### Estructura

Una hoja de cálculo compartida con dos pestañas: **Inventario** (una fila por sitio) y **Bitácora** (una fila por cambio). Hay plantillas con datos ficticios en `inventario_sitios.csv` y `bitacora_cambios.csv`.

**Pestaña Inventario**

| Campo | Qué registra | Ejemplo ficticio |
|---|---|---|
| Cliente | Nombre del cliente | Cliente Demo A |
| Proyecto | Nombre del proyecto | Sitio institucional |
| URL | Dirección pública | https://demo-a.example |
| Plataforma | Sistema y versión | WordPress 6.x |
| Hosting | Proveedor y plan | Proveedor X, plan básico |
| Dominio | Registrador y titular | Registrador Y |
| Renovación hosting | Fecha | 2027-03-15 |
| Renovación dominio | Fecha | 2027-06-01 |
| Licencias | Plugins o temas de pago y su vencimiento | Tema Pro, vence 2027-01-10 |
| Plugins relevantes | Los críticos para el sitio | Caché, SEO, formularios |
| Respaldos | Dónde están, frecuencia y fecha del último | Hosting + nube, semanal, 2026-10-18 |
| Estado | Verde, amarillo o rojo | Verde |
| Pendientes | Tareas abiertas | Actualizar tema |
| Riesgos | Lo que podría fallar | PHP antiguo |
| Accesos | Dónde están, **nunca la contraseña** | Gestor de contraseñas, carpeta "Clientes/Demo A" |
| Responsable | Quién lo administra | Samuel |
| Última revisión | Fecha | 2026-10-20 |

**Pestaña Bitácora:** fecha, sitio, qué se hizo, quién, respaldo previo (sí/no y dónde), resultado y enlace a la evidencia si aplica.

### Cómo la mantendría actualizada

- **Un responsable por sitio** y una revisión mensual de 15 minutos: estado, respaldos y pendientes.
- **Alertas de vencimiento** en el calendario a 60, 30 y 7 días para hosting, dominio y licencias.
- **Regla de trabajo:** ningún cambio se da por terminado hasta anotarlo en la bitácora. Antes de cada cambio se confirma el respaldo; después, se anota el resultado.
- **Accesos fuera de la tabla:** viven en un gestor de contraseñas compartido con permisos por cliente. La tabla solo indica en qué carpeta están.
- **Historial de versiones** de la hoja activado, para saber quién cambió qué.
