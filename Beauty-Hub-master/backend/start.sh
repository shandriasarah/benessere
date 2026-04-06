#!/bin/bash
# Script de instalação e inicialização do backend

echo "🚀 Beauty Hub Backend - Instalação"
echo "=================================="
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "Baixe em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"
echo "✅ npm encontrado: $(npm -v)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""
echo "✅ Dependências instaladas com sucesso!"
echo ""

# Exibir informações importantes
echo "=================================="
echo "ℹ️  INFORMAÇÕES IMPORTANTES:"
echo "=================================="
echo ""
echo "1. Banco de dados: SQLite será criado automaticamente"
echo "2. Admin padrão: user: admin | password: 1234"
echo "3. PORT: 3000 (configurável em .env)"
echo "4. CORS: Configurado para http://localhost:8000"
echo ""

# Iniciar servidor
echo "🟢 Iniciando servidor..."
echo ""
npm start
