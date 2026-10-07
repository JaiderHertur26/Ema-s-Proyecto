# EMAÚS — Configuración Supabase

## Regla principal

EMAÚS debe usar un proyecto Supabase propio.

No reutilizar:
- ContabilidadHertur2026
- REGISTRO SACRAMENTOS

La información de duelo, cartas, recuerdos, emociones y fotografías pertenece a un dominio de privacidad distinto y debe quedar aislada.

## Estado actual

La aplicación ya implementa:

- funcionamiento local sin Supabase
- cliente Supabase opcional
- clave publishable `sb_publishable_...`
- sesión persistente cifrada mediante Expo SecureStore
- creación automática de usuario anónimo cuando la nube esté disponible
- asociación segura entre `profiles.remote_user_id` y `auth.users.id`
- prevención de sustitución silenciosa de identidad
- actualización automática de tokens al volver la app a primer plano
- estado de cuenta visible en “Para mí”

Mientras no existan las variables de entorno válidas, EMAÚS continúa en modo local sin bloquear ninguna experiencia esencial.

## Variables de entorno

Crear `apps/mobile/.env.local` a partir de `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Nunca incluir:
- `service_role`
- `sb_secret_...`
- contraseñas de base de datos

Las variables `EXPO_PUBLIC_...` forman parte del bundle cliente y solo pueden contener valores diseñados para ser públicos.

## Configuración de Auth requerida

En el proyecto Supabase EMAÚS:

1. Authentication → Providers.
2. Habilitar Anonymous Sign-Ins.
3. Antes de beta pública, habilitar protección antiabuso (Captcha/Turnstile).
4. Mantener rate limits apropiados.
5. Habilitar manual identity linking solo cuando se implemente la conversión a cuenta recuperable.
6. No exponer acciones administrativas desde la app móvil.

## Semántica de identidad

### Primera instalación

1. EMAÚS crea perfil local.
2. La persona puede comenzar sin cuenta.
3. Si Supabase está configurado y hay conexión, `signInAnonymously()` crea una identidad.
4. El ID remoto se adjunta al perfil local.

### Sesión existente

Si SecureStore conserva la sesión, se reutiliza la misma identidad remota.

### Sesión perdida

Si SQLite ya contiene `remote_user_id` pero SecureStore no contiene una sesión válida:
- no crear otro usuario anónimo;
- mantener los datos locales disponibles;
- marcar estado `recovery_required`;
- pedir vinculación/recuperación cuando esa experiencia esté implementada.

### Conflicto

Si aparece una sesión cuyo `user.id` no coincide con el `remote_user_id` local:
- no sobrescribir;
- no fusionar automáticamente;
- marcar `identity_conflict`;
- resolver de forma explícita.

## Anónimo no significa público

Un usuario creado con `signInAnonymously()`:
- tiene un UUID real;
- recibe JWT;
- usa el rol PostgreSQL `authenticated`;
- incluye el claim `is_anonymous`;
- no puede recuperar la misma cuenta en otro dispositivo si pierde la sesión antes de vincular una identidad permanente.

Por lo tanto, todas las tablas personales deberán usar RLS con `auth.uid() = user_id`.

## Próxima fase

FASE 3.13 implementará:
- esquema remoto
- RLS
- consumidor de `sync_outbox`
- push/pull de datos
- resolución de conflictos
- estado de sincronización
- pruebas offline → online

La sincronización no se activa hasta que exista el proyecto Supabase EMAÚS y hayan sido auditadas sus políticas RLS.


## Proyecto cloud creado

Proyecto EMAÚS:
- Project ref: `xxcxmzawxsgmcdzzrcsh`
- URL: `https://xxcxmzawxsgmcdzzrcsh.supabase.co`
- Cuenta propietaria indicada por el usuario: `caminoemaus26@gmail.com`

Estado de conexión:
- URL configurada localmente.
- Publishable key pendiente de cargar en `.env.local`.
- El conector/CLI disponible en esta sesión sigue autenticado con otra cuenta y no tiene permiso sobre este proyecto.
- La sesión CLI temporal para EMAÚS está excluida de Git.


## Verificación real del proyecto

Verificación efectuada con la URL y publishable key reales:

- Proyecto accesible: OK.
- Publishable key válida: OK.
- Signups generales deshabilitados: NO.
- `signInAnonymously()`: BLOQUEADO por configuración.
- Respuesta de Supabase: `Anonymous sign-ins are disabled`.

Acción pendiente en Dashboard:
Authentication → Providers → Anonymous → habilitar Anonymous Sign-Ins.

Después de habilitarlo, ejecutar:

```cmd
cd /d "D:\Proyecto EMAÚS\apps\mobile"
node scripts\verify-anonymous-auth.mjs
```

La prueba exige:
- usuario anónimo creado;
- sesión creada;
- sesión restaurada en un segundo cliente;
- mismo `auth.users.id`;
- `is_anonymous = true`.


## Anonymous Auth — verificación completada

Después de habilitar Anonymous Sign-Ins se ejecutó `scripts/verify-anonymous-auth.mjs`.

Resultado:
- `OK_ANONYMOUS_SIGN_IN: true`
- `OK_SESSION_RESTORE: true`
- `OK_SAME_REMOTE_USER: true`
- `IS_ANONYMOUS: true`
- `auth.getUser()` confirmó el mismo usuario con el servidor.

El UUID concreto generado por la prueba no se documenta porque es un dato operativo temporal.

FASE 3.12: COMPLETADA.
