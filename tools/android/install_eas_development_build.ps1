param(
  [Parameter(Mandatory = $true)]
  [string]$BuildId
)

$ErrorActionPreference = 'Stop'

$ProjectRoot = 'D:\Proyecto EMAÚS'
$MobileRoot = Join-Path $ProjectRoot 'apps\mobile'
$ArtifactsRoot = 'D:\EMAUS_NATIVE_BUILD\artifacts'
$Adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
$Eas = 'C:\Users\ASUS\AppData\Local\npm-cache\_npx\6bc7bae5c2059953\node_modules\.bin\eas.cmd'
$Apk = Join-Path $ArtifactsRoot 'emaus-development.apk'

if (-not (Test-Path $Adb)) { throw "adb no encontrado en $Adb" }
if (-not (Test-Path $Eas)) { throw "EAS CLI no encontrada en $Eas" }

New-Item -ItemType Directory -Path $ArtifactsRoot -Force | Out-Null
$env:CI = '1'
$env:EAS_DISABLE_TELEMETRY = '1'

Set-Location $MobileRoot
$raw = (& $Eas build:view $BuildId --json 2>$null | Out-String)
$start = $raw.IndexOf('{')
$end = $raw.LastIndexOf('}')

if ($start -lt 0 -or $end -le $start) { throw 'No se pudo leer la respuesta JSON de EAS.' }

$build = $raw.Substring($start, $end - $start + 1) | ConvertFrom-Json
Write-Output ('BUILD_STATUS=' + $build.status)

if ($build.status -ne 'FINISHED') { throw "El build todavía no está terminado: $($build.status)" }

$url = $build.artifacts.applicationArchiveUrl
if (-not $url) { $url = $build.artifacts.buildUrl }
if (-not $url) { throw 'EAS no devolvió URL del APK.' }

Invoke-WebRequest -Uri $url -OutFile $Apk -UseBasicParsing
Write-Output ('APK=' + $Apk)
Write-Output ('APK_MB=' + [math]::Round((Get-Item $Apk).Length / 1MB, 2))

& $Adb -s emulator-5554 wait-for-device
& $Adb -s emulator-5554 install -r $Apk
if ($LASTEXITCODE -ne 0) { throw "adb install falló con código $LASTEXITCODE" }

$package = (& $Adb -s emulator-5554 shell pm list packages com.caminoemaus.emaus) -join ''
if ($package -notmatch 'com\.caminoemaus\.emaus') { throw 'El paquete EMAÚS no aparece instalado.' }

Write-Output 'ANDROID_INSTALL=PASS'