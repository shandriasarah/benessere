# Benessere — Salão de Beleza

Sistema web completo para gerenciamento de salão de beleza, com área do cliente para agendamento online e painel administrativo. Projeto full-stack desenvolvido com Node.js, MySQL e hospedado na nuvem.

🌐 **Site online:** [https://benessere-seven.vercel.app](https://benessere-seven.vercel.app)

---

## Acesso

**Área do cliente** — cadastre-se diretamente no site

**Painel administrativo:**
- Usuário: `admin`
- Senha: `admin123`

---

## Funcionalidades

### Área do Cliente
- Cadastro e login com autenticação
- Login automático após cadastro
- Escolha de profissional e serviço
- Agendamento online com calendário interativo
- Visualização, edição e cancelamento de agendamentos
- Gerenciamento de perfil

### Painel Administrativo
- Dashboard com indicadores (clientes ativos, agendamentos do dia, faturamento mensal)
- Gráfico de faturamento diário
- Agenda completa de agendamentos
- Cadastro e exclusão de clientes
- Ficha de anamnese
- PDV (Ponto de Venda) com cálculo de troco e histórico

---

## Tecnologias

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Cormorant Garamond + Inter (Google Fonts)
- Font Awesome 6.5
- Chart.js

### Backend
- Node.js
- Express.js
- mysql2
- JWT (autenticação)
- bcrypt (criptografia)
- cors, dotenv

### Banco de Dados
- Google Cloud SQL (MySQL 8.4)

### Hospedagem
- Vercel (frontend + serverless functions)
- GitHub (versionamento + CI/CD)

---

## Estrutura

```
Benessere/
├── public/              # Frontend (HTML, CSS, JS, imagens)
│   ├── css/             # Estilos por página
│   ├── js/              # Scripts por página
│   ├── img/             # Logos e imagens
│   └── *.html           # Páginas do site
├── backend/             # API Node.js
│   ├── routes/          # Rotas da API
│   ├── database/        # Conexão MySQL
│   └── server.js        # Servidor principal
├── api/                 # Adapter para Vercel serverless
└── vercel.json          # Configuração de deploy
```

---

## Identidade Visual

Paleta dourada e bege inspirada em salões de luxo:

- **Dourado:** `#c9a961`
- **Bronze:** `#6b4f2e`
- **Marfim:** `#fdfaf3`
- **Creme:** `#f8f3ea`

Tipografia: **Cormorant Garamond** (serif elegante para títulos) + **Inter** (sans-serif para corpo).

---

## Como rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/shandriasarah/benessere.git
cd benessere

# 2. Instale as dependências do backend
cd backend
npm install

# 3. Crie um arquivo .env com as credenciais do banco
# (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, JWT_SECRET)

# 4. Inicie o servidor
node server.js

# 5. Acesse no navegador
# http://localhost:3000
```

---

## Desenvolvido por

**Sarah Shandria** — Projeto desenvolvido em 2026

© 2026 Benessere — Todos os direitos reservados.
