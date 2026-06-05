# Aplica CORS no bucket do Firebase Storage (necessário para download em produção).
# Requer Google Cloud SDK: https://cloud.google.com/sdk/docs/install

$bucket = "gs://simaceito.firebasestorage.app"
$corsFile = Join-Path $PSScriptRoot "..\storage.cors.json"

if (-not (Get-Command gsutil -ErrorAction SilentlyContinue)) {
  Write-Error "gsutil não encontrado. Instale o Google Cloud SDK e execute: gcloud auth login"
  exit 1
}

Write-Host "Aplicando CORS em $bucket ..."
gsutil cors set $corsFile $bucket

if ($LASTEXITCODE -eq 0) {
  Write-Host "CORS aplicado com sucesso."
  gsutil cors get $bucket
} else {
  Write-Host "Tentando bucket legado gs://simaceito.appspot.com ..."
  gsutil cors set $corsFile gs://simaceito.appspot.com
}
