# EMAÚS — Notificaciones V1

## Principio

Las notificaciones acompañan; no persiguen al usuario.

Por eso:

- son locales en V1;
- no usan FCM/APNs remoto para el contenido de acompañamiento;
- no se solicita permiso al abrir la app;
- recordatorio diario viene apagado;
- fechas importantes vienen apagadas;
- mostrar el nombre del ser querido viene apagado;
- cualquier activación requiere acción explícita del usuario.

## Recordatorio diario

El usuario puede:

- activarlo o desactivarlo;
- elegir la hora;
- recibir un texto breve, sobrio y no clínico.

Texto base:

- título: “Un momento para ti”
- cuerpo: invitación opcional a oración, recuerdo o cuidado.

No usa sonido ni vibración desde la configuración de EMAÚS.

## Fechas importantes

Cuando el usuario activa esta opción, EMAÚS puede programar:

- nueve días, si la fecha de partida es exacta y todavía está por venir;
- primer mes, si todavía está por venir;
- aniversario de la partida, anual;
- cumpleaños, anual, solo cuando exista fecha;
- fechas manuales guardadas en `special_dates`.

EMAÚS no inventa fechas cuando la precisión no es suficiente.

## Privacidad

Por defecto:

- no se muestra el nombre del ser querido;
- el texto visible en una notificación especial es genérico;
- Android usa un canal con visibilidad `SECRET` en lockscreen;
- no hay sonido;
- no hay vibración;
- no hay badge.

El usuario puede activar voluntariamente “Mostrar nombre en la notificación”.

## Permisos

- abrir la pantalla de Notificaciones no solicita permiso;
- el permiso se pide solo al intentar activar una función o probar una notificación;
- si el sistema ya no permite preguntar, EMAÚS ofrece abrir Ajustes del dispositivo;
- revocar el permiso no borra las preferencias, pero impide programar entregas hasta que el permiso vuelva a existir.

## Programación

- disparador diario nativo;
- disparadores anuales nativos para aniversario/cumpleaños;
- disparadores por fecha para nueve días, primer mes y fechas manuales;
- el calendario local se reconstruye al abrir la app y cada vez que cambia una preferencia.

## Validaciones técnicas

- SQLite V6.
- upgrade V1→V6 preserva datos.
- notificaciones diarias y especiales quedan en opt-in.
- hora por defecto: 08:00, visible y editable antes de activar.
- nombre visible: false por defecto.
- Expo Config: OK.
- Expo Doctor: 21/21.
- dependencias: alineadas con SDK 57.
- TypeScript: OK.
- ESLint: OK.
- export Android: OK.

## Pendiente de prueba física

Se realizará en FASE 3.17/3.18:

- diálogo real de permiso Android/iOS;
- entrega a la hora elegida;
- disparador anual;
- canal Android sin sonido/vibración;
- visibilidad de lockscreen;
- prueba manual a 2 segundos;
- persistencia de programaciones tras reinicio del teléfono;
- cambio de zona horaria;
- comportamiento con ahorro de batería / restricciones del sistema.

## Fuera de V1

- push remoto de acompañamiento;
- campañas;
- marketing;
- notificaciones generadas por IA;
- seguimiento de apertura con fines publicitarios.
