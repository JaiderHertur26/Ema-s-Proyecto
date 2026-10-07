# EMAÚS — Línea base de seguridad V1

## Objetivo

EMAÚS almacena información especialmente sensible: duelo, cartas, recuerdos, estados emocionales y fotografías. La seguridad V1 se diseña para reducir exposición ante pérdida del dispositivo, acceso físico no autorizado, errores de configuración cloud, sesiones cruzadas y publicación accidental de archivos.

## Controles locales

### Base de datos

- SQLite usa SQLCipher en builds nativos.
- La clave local se genera con 32 bytes aleatorios.
- La clave se guarda en Expo SecureStore.
- La clave usa `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`.
- `PRAGMA key` se ejecuta antes de migrar o consultar tablas.
- Las migraciones se aplican dentro de transacciones exclusivas.
- Android Auto Backup está desactivado.

### Sesión de Supabase

- La sesión se guarda en SecureStore.
- Los valores grandes se fragmentan antes de guardarse.
- El almacenamiento de sesión usa `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`.
- Si SQLite conoce una identidad remota y la sesión desaparece, EMAÚS no crea otra identidad automáticamente.
- Una sesión cuyo usuario no coincide con el perfil local entra en estado de conflicto y no reemplaza el ID existente.

### Bloqueo del dispositivo

- El usuario puede activar bloqueo local de EMAÚS.
- La activación y desactivación exigen autenticación del dispositivo.
- Se solicitan biometrías fuertes cuando el sistema las soporta.
- El código del dispositivo puede actuar como fallback cuando el sistema lo ofrece.
- Al pasar la app a segundo plano, EMAÚS vuelve a estado bloqueado.
- Si el dispositivo deja de tener biometría registrada, el bloqueo local se desactiva para evitar un bloqueo permanente; puede reactivarse después.

### Capturas y selector de aplicaciones

- El usuario puede activar protección de capturas y grabación.
- Android usa la protección nativa de screen capture.
- iOS usa protección de captura y desenfoque del app switcher.
- Cuando EMAÚS está bloqueado, se aplica protección de captura aunque la preferencia general esté desactivada.

## Controles cloud

### PostgreSQL

- Todas las tablas personales usan RLS.
- La regla principal es `auth.uid() = user_id`.
- Las relaciones sensibles usan foreign keys compuestas con `user_id` para evitar enlaces cruzados.
- `RLS_ISOLATION: PASS` con dos usuarios anónimos distintos.
- Un cliente con publishable key pero sin sesión no puede leer ni escribir datos personales.
- `UNAUTHENTICATED_ACCESS: DENIED`.

### Storage

- Bucket `emaus-private`.
- Bucket no público.
- Rutas de objetos comienzan por `auth.uid()`.
- RLS separado para SELECT, INSERT, UPDATE y DELETE.
- Usuario B no puede listar, descargar ni escribir en la carpeta de A.
- Las URLs públicas directas están bloqueadas.
- Las URLs firmadas, cuando se usan, son temporales.
- `STORAGE_RLS_ISOLATION: PASS`.
- `PHOTO_MEMORY_ROUNDTRIP: PASS`.

## Secretos y repositorio

Verificado:

- `.env.local` no está versionado.
- Solo `.env.example` está en Git.
- No hay `sb_secret_` real.
- No hay `service_role` real.
- No hay cadenas PostgreSQL con credenciales.
- No hay claves privadas.
- No hay `console.log/debug/info/warn/error` en `apps/mobile/src`.
- La app cliente utiliza únicamente URL Supabase + publishable key.

## Dependencias

Estado actual:

- Expo Doctor: 21/21.
- `expo install --check`: dependencias alineadas con SDK 57.
- `npm audit --omit=dev`: 30 avisos transitivos, 11 moderate y 19 high.
- Los avisos conocidos pasan principalmente por Expo/Metro/config-plugins/build tooling.
- `npm audit fix --force` propone cambios incompatibles, incluyendo downgrade de Expo a 44.
- No se aplica `--force`.
- Se revisarán parches compatibles con SDK 57 o el SDK vigente antes de publicación.

## Pendiente de validación física

Se comprobará en las fases Android/iOS:

- SQLCipher en build nativo real.
- Persistencia de SecureStore después de matar/reabrir la app.
- Bloqueo biométrico real.
- Fallback al código del dispositivo.
- Rebloqueo al volver del background.
- Capturas bloqueadas.
- Grabación de pantalla bloqueada.
- App switcher oculto/desenfocado.
- Android Manifest con backup desactivado.
- comportamiento de privacidad de archivos locales en iOS.

## Bloqueos antes de beta pública

- Activar Captcha/Turnstile para Anonymous Auth.
- Revisar rate limits de Supabase Auth.
- Ejecutar pruebas físicas Android e iOS.
- Repetir auditoría de dependencias con versiones publicables.
- Completar auditoría integral de FASE 3.19.

## Regla

Una protección no se considera “verificada” solo porque compile. Las protecciones que dependen de hardware o comportamiento nativo deben pasar prueba física en dispositivo antes de beta.
