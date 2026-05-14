# Lists prisma migration folders and whether migration.sql exists (fixes debugging P3015).
$migrationsRoot = Resolve-Path (Join-Path $PSScriptRoot "..\prisma\migrations")
Write-Host "Scanning: $migrationsRoot`n"
Get-ChildItem $migrationsRoot -Directory | ForEach-Object {
  $sql = Join-Path $_.FullName "migration.sql"
  if (Test-Path -LiteralPath $sql) {
    Write-Host "[OK]   $($_.Name)"
  } else {
    Write-Host "[BAD]  $($_.Name) — migration.sql missing (delete this folder or add file)"
  }
}
