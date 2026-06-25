# Benessere Backend

Backend API desenvolvido em Node.js para o sistema de agendamento de serviços de beleza **Benessere**.

## 📋 Funcionalidades

- ✅ Autenticação de clientes e admins
- ✅ Cadastro de novos clientes
- ✅ Gerenciamento de profissionais e serviços
- ✅ Sistema de agendamentos com verificação de horários disponíveis
- ✅ Dashboard administrativo com estatísticas
- ✅ Histórico de agendamentos
- ✅ Perfil de cliente com atualização de dados

## 🚀 Instalação

### Pré-requisitos
- Node.js 14+ instalado
- npm ou yarn

### Passos

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente (.env):**
```
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
DATABASE_PATH=./database.db
CORS_ORIGIN=http://localhost:8000
```

3. **Iniciar o servidor:**
```bash
npm start
```

**Ou em modo desenvolvimento (com auto-reload):**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints API

### Autenticação (`/api/auth`)
- `POST /login-cliente` - Login de cliente
- `POST /login-admin` - Login de admin
- `POST /cadastro-cliente` - Cadastro de novo cliente
- `POST /logout` - Logout

### Profissionais (`/api/professionals`)
- `GET /` - Listar todos os profissionais com serviços
- `GET /:id` - Obter profissional específico
- `POST /criar` - Criar novo profissional (admin)

### Agendamentos (`/api/appointments`)
- `GET /meus-agendamentos/:userId` - Agendamentos do cliente
- `POST /criar` - Criar novo agendamento
- `GET /dia/:date` - Agendamentos de um dia específico
- `GET /horarios-disponiveis/:professionalId/:date` - Horários disponíveis
- `PUT /cancelar/:appointmentId` - Cancelar agendamento

### Admin (`/api/admin`)
- `GET /dashboard` - Estatísticas do dashboard
- `GET /usuarios` - Listar todos os usuários
- `GET /agendamentos` - Listar todos os agendamentos
- `GET /faturamento/:mes/:ano` - Faturamento por período
- `DELETE /usuario/:id` - Deletar usuário
- `PUT /agendamento/:id/reverter` - Reverter status do agendamento

### Clientes (`/api/clients`)
- `GET /perfil/:id` - Obter perfil do cliente
- `PUT /perfil/:id` - Atualizar perfil do cliente
- `GET /agendamentos/:id` - Histórico de agendamentos

## 📊 Banco de Dados

O backend usa **SQLite** para armazenamento de dados. As tabelas são criadas automaticamente:

- **users** - Dados de clientes
- **admins** - Dados de administradores
- **professionals** - Profissionais
- **services** - Serviços oferecidos
- **appointments** - Agendamentos realizados

### Dados Padrão
- **Admin padrão:** user: `admin`, senha: `1234`
- **Profissionais:** Marília Andrade e João Silva (com seus respectivos serviços)

## 🔐 Autenticação

O sistema usa **JWT (JSON Web Tokens)** para autenticação. Após login, um token é retornado e deve ser enviado no header:

```
Authorization: Bearer <token>
```

## 📝 Exemplo de Uso

### 1. Cadastro de Cliente
```bash
POST http://localhost:3000/api/auth/cadastro-cliente
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "senha": "senha123"
}
```

### 2. Login de Cliente
```bash
POST http://localhost:3000/api/auth/login-cliente
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### 3. Criar Agendamento
```bash
POST http://localhost:3000/api/appointments/criar
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": 1,
  "professional_id": 1,
  "service_id": 1,
  "appointment_date": "2026-04-10",
  "appointment_time": "14:00",
  "total_price": 80.00
}
```

## 🛠️ Tecnologias Utilizadas

- **Express.js** - Framework web
- **SQLite3** - Banco de dados
- **JWT** - Autenticação
- **Bcryptjs** - Hash de senhas
- **CORS** - Segurança de requisições
- **dotenv** - Variáveis de ambiente

## 📌 Notas Importantes

- O banco de dados é criado automaticamente na primeira execução
- As senhas são armazenadas em texto plano (para produção, use bcrypt)
- Os serviços e profissionais são inseridos automaticamente
- O CORS está configurado para aceitar requisições do frontend local

## 🔄 Integração com Frontend

O frontend já está pronto para usar este backend. Basta atualizar as URLs das requisições AJAX para:

```javascript
const API_URL = 'http://localhost:3000/api';
```

## 📱 Estrutura de Pastas

```
backend/
├── database/
│   └── init.js          # Inicialização do banco de dados
├── middleware/
│   └── auth.js          # Middleware de autenticação
├── routes/
│   ├── auth.js          # Rotas de autenticação
│   ├── appointments.js  # Rotas de agendamentos
│   ├── professionals.js # Rotas de profissionais
│   ├── admin.js         # Rotas administrativas
│   └── clients.js       # Rotas de clientes
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências do projeto
├── README.md            # Este arquivo
└── server.js            # Arquivo principal
```

## 🐛 Troubleshooting

### Erro: "SQLITE_CANTOPEN"
- Verifique permissões de escrita no diretório
- Tente deletar o arquivo `database.db` e reinicie o servidor

### Erro: "Port already in use"
- Mude a PORT no arquivo `.env`
- Ou feche a aplicação que está usando aquela porta

### CORS errors
- Verifique se a URL do frontend está configurada corretamente em `CORS_ORIGIN`

## 📄 Licença

MIT

---

**Desenvolvido para Benessere** 💄✨
