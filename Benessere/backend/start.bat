@echo off
REM Script de instalação e inicialização do backend para Windows

echo.
echo 🚀 Benessere Backend - Instalação
echo ==================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não está instalado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo ✅ Node.js encontrado: %NODE_VERSION%
echo ✅ npm encontrado: %NPM_VERSION%
echo.

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo.
echo ✅ Dependências instaladas com sucesso!
echo.

REM Exibir informações importantes
echo ==================================
echo ℹ️  INFORMAÇÕES IMPORTANTES:
echo ==================================
echo.
echo 1. Banco de dados: SQLite será criado automaticamente
echo 2. Admin padrão: user: admin ^| password: 1234
echo 3. PORT: 3000 (configurável em .env)
echo 4. CORS: Configurado para http://localhost:8000
echo.

REM Iniciar servidor
echo 🟢 Iniciando servidor...
echo.
call npm start
pause
