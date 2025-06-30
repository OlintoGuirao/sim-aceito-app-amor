# Script para aplicar as regras do Firestore
# Execute este script para atualizar as regras de segurança

Write-Host "🔥 Aplicando regras do Firestore..." -ForegroundColor Green

# Verificar se o Firebase CLI está instalado
try {
    firebase --version
} catch {
    Write-Host "❌ Firebase CLI não encontrado. Instalando..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Fazer login no Firebase (se necessário)
Write-Host "🔐 Verificando login no Firebase..." -ForegroundColor Yellow
firebase login --no-localhost

# Aplicar as regras do Firestore
Write-Host "📝 Aplicando regras do Firestore..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

Write-Host "✅ Regras do Firestore aplicadas com sucesso!" -ForegroundColor Green
Write-Host "🔄 Aguarde alguns minutos para as regras serem propagadas..." -ForegroundColor Yellow 