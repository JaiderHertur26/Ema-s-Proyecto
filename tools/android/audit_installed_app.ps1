$ErrorActionPreference = 'Stop'

$Package = 'com.caminoemaus.emaus'
$Adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'

if (-not (Test-Path $Adb)) { throw "adb no encontrado en $Adb" }

& $Adb -s emulator-5554 wait-for-device

$packages = (& $Adb -s emulator-5554 shell pm list packages $Package) -join ''
if ($packages -notmatch [regex]::Escape($Package)) { throw 'EMAÚS no está instalado.' }

$dumpsys = (& $Adb -s emulator-5554 shell dumpsys package $Package) -join [Environment]::NewLine

$hasAudio = $dumpsys -match 'android\.permission\.RECORD_AUDIO'
$hasBiometric = $dumpsys -match 'android\.permission\.USE_BIOMETRIC'
$hasFingerprint = $dumpsys -match 'android\.permission\.USE_FINGERPRINT'

Write-Output ('PACKAGE_INSTALLED=true')
Write-Output ('REQUESTS_RECORD_AUDIO=' + $hasAudio)
Write-Output ('REQUESTS_USE_BIOMETRIC=' + $hasBiometric)
Write-Output ('REQUESTS_USE_FINGERPRINT=' + $hasFingerprint)

if ($hasAudio) { throw 'El paquete instalado todavía solicita RECORD_AUDIO.' }
if (-not $hasBiometric) { throw 'El paquete instalado no declara USE_BIOMETRIC.' }

$dbList = (& $Adb -s emulator-5554 shell run-as $Package sh -c 'find databases -maxdepth 1 -type f 2>/dev/null') -join [Environment]::NewLine
Write-Output 'DATABASE_FILES_BEGIN'
Write-Output $dbList
Write-Output 'DATABASE_FILES_END'

Write-Output 'ANDROID_PACKAGE_AUDIT=PASS'