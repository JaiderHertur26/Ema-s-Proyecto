# EMAÚS — Arquitectura Técnica V1

## Estado de la Ruta Maestra

FASE 0 · Concepto — COMPLETADA  
FASE 1A · Método EMAÚS — COMPLETADA  
FASE 1B · Arquitectura funcional — COMPLETADA  
FASE 2 · UX, contenido y motor de acompañamiento — COMPLETADA  
FASE 3 · Construcción técnica — INICIADA

Ruta local: `D:\Proyecto EMAÚS`  
App móvil: `D:\Proyecto EMAÚS\apps\mobile`  
Repositorio: `JaiderHertur26/Ema-s-Proyecto`  
Vercel: `emaus-proyecto` (reservado para panel web/admin futuro)

## 1. Principios técnicos

1. Local-first: la experiencia esencial funciona sin conexión.
2. Privado por defecto: diario, cartas y recuerdos no se publican ni comparten automáticamente.
3. Offline real: SQLite es la fuente local de lectura/escritura cotidiana.
4. Nube como respaldo y sincronización, no como requisito para usar la app.
5. Sin IA abierta en V1: el motor inicial será determinista, auditable y basado en contenido aprobado.
6. Seguridad antes que personalización.
7. Doctrina católica y acompañamiento psicológico se modelan por separado, pero convergen en la experiencia.
8. Sin gamificación del duelo.
9. Sin diagnósticos clínicos.
10. Sin simulación del fallecido.

## 2. Stack móvil

- Expo SDK 57
- React Native 0.86
- React 19.2
- TypeScript
- Expo Router
- Expo SQLite
- Expo SecureStore
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- EAS Build para Android/iOS

## 3. Estructura del repositorio

```text
Proyecto EMAÚS/
├─ identidad visual/
├─ docs/
├─ apps/
│  ├─ mobile/
│  └─ admin/              # futuro
└─ packages/              # futuro
   ├─ domain/
   ├─ content-schema/
   └─ design-tokens/
```

La V1 se construye primero en `apps/mobile`. El panel web no condiciona el lanzamiento móvil.

## 4. Identidad y autenticación

EMAÚS no pide correo al inicio.

Flujo:
1. El usuario completa onboarding local.
2. Se crea identidad anónima en Supabase cuando haya conexión.
3. El usuario puede usar la app sin aportar PII.
4. Cuando quiera respaldo recuperable/multidispositivo, vincula email, Google o Apple.
5. Nunca se fuerza el registro antes del primer acompañamiento.

Advertencia UX: una cuenta anónima no es recuperable si se pierde el dispositivo o se cierra sesión sin haber vinculado una identidad.

## 5. Persistencia local

SQLite será la base operativa local.

Tablas locales principales:
- profile
- loved_ones
- grief_journeys
- emotional_checkins
- memories
- letters
- support_contacts
- prayer_logs
- masses
- special_dates
- user_preferences
- content_cache
- sync_outbox
- sync_metadata

Los secretos y claves pequeñas se guardan en SecureStore.

Para producción se habilitará SQLCipher mediante configuración nativa de expo-sqlite. La app usará Development Build/EAS; Expo Go no será el entorno de producción.

## 6. Sincronización V1

No se incorpora PowerSync inicialmente.

Patrón:
- UUID generado en cliente.
- Escritura inmediata en SQLite.
- Se registra operación en `sync_outbox`.
- Cuando existe red y sesión válida, se envía a Supabase.
- Confirmación remota marca la operación como sincronizada.
- Reintentos con backoff.
- Borrados mediante tombstone hasta confirmar sincronización.

Resolución de conflictos:
- Check-ins y registros de oración: append-only.
- Perfil/preferencias: última modificación válida gana.
- Cartas/recuerdos: no sobrescribir silenciosamente versiones concurrentes.
- Archivos multimedia: cola separada de subida.
- Ninguna pérdida de datos por desconexión debe bloquear la interfaz.

## 7. Supabase

Tablas remotas:
- profiles
- loved_ones
- grief_journeys
- emotional_checkins
- memories
- letters
- support_contacts
- prayer_logs
- masses
- special_dates
- user_preferences
- content_catalog
- content_versions

Todas las tablas personales llevan `user_id` y Row Level Security.

Regla base:
`auth.uid() = user_id`

Storage:
- bucket privado
- rutas por usuario y ser querido
- acceso mediante políticas y URLs firmadas
- nunca URLs públicas permanentes para fotografías personales

## 8. Motor de acompañamiento

Orden de prioridad:

1. Seguridad
2. Estado presente
3. Intensidad emocional
4. Fecha/momento del duelo
5. Relación con la persona fallecida
6. Contexto especial
7. Camino espiritual
8. Contenido recomendado

El motor V1 no usa un LLM.

Entradas:
- tiempo desde la partida
- emoción actual
- intensidad
- relación
- historial reciente
- fecha especial
- hora del día
- preferencias espirituales

Salida:
- ruta emocional
- Palabra
- reflexión
- pequeño paso
- oración
- acción opcional

## 9. Seguridad clínica

El flujo normal se interrumpe cuando se detecta riesgo alto.

No se guardarán por defecto textos sensibles de una crisis como material analítico permanente.

La app:
- prioriza contacto humano
- muestra red de apoyo
- ofrece acceso a ayuda profesional/emergencia según región
- evita respuestas espirituales como sustituto de atención urgente
- permite oración breve solo como complemento

## 10. Privacidad

- sin publicidad conductual
- sin venta de datos emocionales
- sin entrenamiento externo con cartas/diario sin consentimiento explícito
- biometría opcional
- exportación de datos
- borrado de cuenta y contenido
- telemetría mínima
- nunca enviar texto de cartas/diario a analítica

## 11. Contenido

El contenido no estará incrustado únicamente en componentes.

Modelo versionado:
- content_id
- locale
- content_type
- grief_window
- emotion_tags
- relationship_tags
- scripture_ref
- body
- prayer
- small_step
- doctrinal_review_status
- clinical_review_status
- version
- published_at

La app descarga versiones aprobadas y conserva caché offline.

## 12. Notificaciones

Opt-in.

Tipos:
- acompañamiento diario
- fecha especial
- oración preparada

Reglas:
- sin culpabilizar
- sin rachas
- sin “tareas pendientes”
- sin asumir que una fecha será dolorosa
- posibilidad de apagar todo

## 13. Vercel

El proyecto Vercel se reserva para:
- panel de administración de contenidos
- revisión doctrinal/psicológica
- publicación y versionado de contenidos
- herramientas internas futuras

No será dependencia para que la app móvil funcione.

## 14. Git

El repositorio será la fuente de verdad del código.

Ramas previstas:
- main: estable
- develop: integración
- feature/*: trabajo puntual

Antes de publicar:
- lint
- typecheck
- pruebas del motor
- build Android
- build iOS
- auditoría de RLS
- auditoría de privacidad

## 15. Orden de construcción

3.1 Esqueleto Expo + Router  
3.2 Design system  
3.3 Persistencia SQLite  
3.4 Modelo de dominio  
3.5 Onboarding  
3.6 HOY sin nube  
3.7 Motor de personalización  
3.8 Orar  
3.9 Recuerdos  
3.10 Mi Camino  
3.11 Rutas emocionales  
3.12 Supabase Auth anónimo  
3.13 Sincronización  
3.14 Storage  
3.15 Seguridad  
3.16 Notificaciones  
3.17 Android  
3.18 iOS  
3.19 Auditoría integral  
3.20 Beta cerrada

## 16. Regla de cambio

Toda nueva función debe responder:

1. ¿Ayuda directamente a alguien que atraviesa un duelo?
2. ¿Es coherente con la doctrina católica?
3. ¿Es psicológicamente responsable?
4. ¿Respeta privacidad y autonomía?
5. ¿Pertenece a la fase actual?

Si alguna respuesta es no, no entra todavía.


## 17. Estado de implementación — FASE 3

Actualizado durante la construcción inicial:

- 3.1 Esqueleto Expo + Router — COMPLETADO
- 3.2 Design system inicial — COMPLETADO
- 3.3 Persistencia SQLite local — COMPLETADO
- 3.4 Modelo de dominio inicial — COMPLETADO
- 3.5 Onboarding local de extremo a extremo — COMPLETADO EN PRIMERA VERSIÓN
- 3.6 Pantalla HOY conectada al camino activo — BASE FUNCIONAL
- 3.7 Motor de personalización — COMPLETADO EN PRIMERA VERSIÓN
- 3.8 Orar — BASE FUNCIONAL: oración inmediata + registro privado
- 3.9 Recuerdos — PENDIENTE
- 3.10 Mi Camino — COMPLETADO EN PRIMERA VERSIÓN
- 3.11 Rutas emocionales — COMPLETADO EN PRIMERA VERSIÓN
- 3.12 Supabase Auth anónimo — PENDIENTE

### Persistencia actual

La base local usa `expo-sqlite` y está configurada para SQLCipher en builds nativos.
La clave de 256 bits se genera con `expo-crypto` y se conserva en `expo-secure-store`.
SQLite usa WAL, claves foráneas y timeout de bloqueo.

El usuario puede abandonar el onboarding y reanudarlo desde el último paso persistido.

### Validaciones actuales

- ESLint: OK
- TypeScript: OK
- Expo Doctor: 21/21
- Export Android: OK
- Migración SQLite ejecutada contra SQLite real: OK
- Tablas requeridas: 15/15

### Nota de dependencias

El árbol de Expo reporta avisos de `npm audit` en dependencias transitivas.
No se ejecuta `npm audit fix --force` porque propone cambios incompatibles con la versión de Expo.
Se revisará y actualizará mediante versiones compatibles del SDK, sin romper el árbol nativo.


### FASE 3.9 — Recuerdos

Incluido en la primera versión funcional:

- Su historia: recuerdos de texto privados.
- Lo que me enseñó: legado y aprendizajes.
- Momentos que no quiero olvidar.
- Cartas privadas.
- Llevar una carta a la oración sin simular respuestas del fallecido.
- Archivo y consulta de cartas.
- Fotografías seleccionadas explícitamente por el usuario.
- Copia de fotografías al almacenamiento privado de documentos de la app.
- Metadatos de cartas, recuerdos y fotografías preparados para futura sincronización mediante `sync_outbox`.

No incluido todavía:

- Audios.
- Fechas especiales dentro de Recuerdos.
- Compartir recuerdos entre familiares.
- Sincronización multimedia con la nube.

Estas funciones no bloquean el MVP de Recuerdos y se mantienen en backlog.


### FASE 3.10 — Mi Camino

Incluido en la primera versión funcional:

- Cálculo del momento actual cuando la fecha de partida es exacta.
- Sin porcentajes ni concepto de “duelo completado”.
- Si la fecha es desconocida, no se inventa una etapa.
- Recorridos disponibles: Primeros días, Exequias, Nueve días, Primer mes, Meses siguientes, Fechas importantes, Primer aniversario y Después del primer año.
- Exequias y Fechas importantes permanecen siempre disponibles porque no pueden deducirse honestamente solo por calendario.
- Cada recorrido abre Palabra, reflexión, pequeño paso y oración.
- Todos los recorridos pueden abrirse aunque no correspondan al momento calculado.
- EMAÚS registra localmente que un contenido ya fue visitado y muestra “Ya recorriste este contenido. Puedes volver cuando quieras.”
- Nueva migración SQLite V2: `journey_stage_visits`.
- Prueba de actualización V1→V2 con conservación de datos: OK.


### FASE 3.11 — Rutas emocionales

Incluido en la primera versión funcional:

- Acceso real desde “Hoy me está costando mucho”.
- Rutas: llanto intenso, ansiedad, culpa, rabia, soledad, insomnio, miedo, recuerdo inesperado, necesidad de Dios, necesidad de hablar y “no sé qué siento”.
- Intensidad humana: suave, moderado, muy fuerte o “no sé”.
- Los estados que corresponden se registran como check-ins emocionales reales en SQLite.
- Las rutas intensas priorizan regulación breve y sugieren compañía humana.
- Ruta específica de apoyo humano.
- Entrada explícita de seguridad para personas que temen hacerse daño o no pueden mantenerse seguras.
- En seguridad, la app prioriza: no permanecer solo, avisar claramente a una persona, reducir acceso a medios de daño cuando sea seguro y contactar servicios de emergencia/crisis de la región.
- La oración aparece solo como complemento y nunca sustituye ayuda urgente.
- EMAÚS declara explícitamente que no es un servicio de emergencia.

La V1 todavía no muestra números telefónicos regionales automáticos; estos se incorporarán cuando exista configuración segura por país/región y red de apoyo del usuario.
