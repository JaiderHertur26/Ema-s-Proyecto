# EMAÚS — Validación Android V1

## Build

- Proyecto EAS: `@aplicacioncamino/emaus-proyecto`.
- Package: `com.caminoemaus.emaus`.
- SDK: Expo 57.
- Perfil: `development` / distribución interna.
- Project ID: `aa81955d-0e4f-45bc-b08d-9dcf7b07ef54`.
- Build limpio objetivo: `1bf0510c-99a2-4354-aa5a-b3c08500ed5c`.
- Commit del build: `8a931da`.

## Reglas nativas verificadas antes del build

- `android.allowBackup=false`.
- SQLCipher habilitado mediante plugin de `expo-sqlite`.
- `USE_BIOMETRIC` y `USE_FINGERPRINT` presentes.
- `RECORD_AUDIO` bloqueado explícitamente con `blockedPermissions` y `tools:node="remove"`.
- No se crean unidades E:/X: para compilar.
- La ruta maestra continúa siendo `D:\Proyecto EMAÚS`.

## Pruebas después de instalar el APK

1. Paquete instalado y arranque sin crash.
2. Manifest/aplicación instalada no solicita `RECORD_AUDIO`.
3. Biometría disponible para la función de bloqueo.
4. Crear/abrir SQLite y comprobar que el archivo no empieza con `SQLite format 3`, evidencia de SQLCipher activo.
5. Matar proceso y reabrir: los datos y la sesión sobreviven mediante SQLite + SecureStore.
6. Background → foreground con bloqueo activado: EMAÚS vuelve bloqueado.
7. Protección de captura: screenshot/grabación bloqueados cuando se activa.
8. Notificaciones: permiso solo después de opt-in, prueba local discreta, sin sonido/vibración.
9. Supabase: identidad anónima, sync y estado de respaldo sin errores.
10. Reinicio adicional para comprobar estabilidad.

## Herramientas

- `tools/android/install_eas_development_build.ps1`
- `tools/android/audit_installed_app.ps1`

## Criterio de cierre

FASE 3.17 no se marca como completada hasta instalar un build Android nativo y pasar las comprobaciones que dependen del dispositivo. Las limitaciones del emulador (por ejemplo biometría real) se documentan por separado y se repiten en un dispositivo físico antes de beta.