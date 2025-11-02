# Script para exportar el certificado SSL del API Gateway
# Este certificado debe ser importado en el navegador para confiar en HTTPS

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Exportar Certificado SSL" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el contenedor esté corriendo
$container = docker ps --filter "name=fe_web-api-gateway-1" --format "{{.Names}}"
if (-not $container) {
    Write-Host "ERROR: El contenedor API Gateway no esta corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta primero: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK - Contenedor encontrado: $container" -ForegroundColor Green
Write-Host ""

# Crear directorio para certificados si no existe
$certDir = ".\certs"
if (-not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
}

# Exportar certificado
Write-Host "Exportando certificado..." -ForegroundColor Yellow
docker cp fe_web-api-gateway-1:/app/certs/server.crt .\certs\api-gateway.crt

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Certificado exportado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ubicacion: $(Resolve-Path .\certs\api-gateway.crt)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  Proximos Pasos" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para confiar en este certificado:" -ForegroundColor White
    Write-Host ""
    Write-Host "OPCION 1 - Chrome/Edge/Opera:" -ForegroundColor Yellow
    Write-Host "1. Abre el navegador" -ForegroundColor White
    Write-Host "2. Ve a: chrome://settings/certificates" -ForegroundColor White
    Write-Host "3. Click en 'Autoridades' > 'Importar'" -ForegroundColor White
    Write-Host "4. Selecciona: certs\api-gateway.crt" -ForegroundColor White
    Write-Host "5. Marca: 'Confiar en este certificado para identificar sitios web'" -ForegroundColor White
    Write-Host "6. Click 'Aceptar'" -ForegroundColor White
    Write-Host ""
    Write-Host "OPCION 2 - Firefox:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://localhost:8080" -ForegroundColor White
    Write-Host "2. Click en 'Avanzado' > 'Aceptar el riesgo y continuar'" -ForegroundColor White
    Write-Host ""
    Write-Host "OPCION 3 - Importar manualmente:" -ForegroundColor Yellow
    Write-Host "1. Doble click en: certs\api-gateway.crt" -ForegroundColor White
    Write-Host "2. Click 'Instalar certificado...'" -ForegroundColor White
    Write-Host "3. Selecciona 'Equipo local'" -ForegroundColor White
    Write-Host "4. Selecciona 'Colocar todos los certificados en el siguiente almacen'" -ForegroundColor White
    Write-Host "5. Click 'Examinar' y selecciona 'Entidades de certificacion raiz de confianza'" -ForegroundColor White
    Write-Host "6. Click 'Siguiente' > 'Finalizar'" -ForegroundColor White
    Write-Host "7. Aceptar la advertencia de seguridad" -ForegroundColor White
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Despues de importar, recarga la pagina: http://localhost/" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "ERROR - No se pudo exportar el certificado" -ForegroundColor Red
    exit 1
}
