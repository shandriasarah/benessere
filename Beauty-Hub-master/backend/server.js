require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("./database/init");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const professionalsRoutes = require("./routes/professionals");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/clients");
const path = require("path");

const app = express();

// O Render define a porta automaticamente, por isso usamos process.env.PORT
const PORT = process.env.PORT || 3000;

// Configuração de CORS simplificada para evitar erros no navegador
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURAÇÃO DO BANCO ---
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 24756,
  connectTimeout: 60000,
};

const db = new Database(dbConfig);
db.init()
  .then(() => console.log("✅ Banco de dados conectado com sucesso!"))
  .catch((err) => {
    console.error("Erro ao inicializar banco de dados:", err);
  });

// Middleware para passar o pool do banco para as rotas
app.use((req, res, next) => {
  req.db = db.getPool();
  next();
});

// Ajustado de ../../public para ../public (para bater certinho com a estrutura de pastas no Render)
app.use(express.static(path.join(__dirname, "../public")));

// --- ROTA DE REGISTRO ---
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const pool = db.getPool();

  if (!pool) {
    return res
      .status(500)
      .json({ message: "Servidor ainda conectando ao banco..." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    pool.query(sql, [name, email, hashPassword], (err, result) => {
      if (err) {
        console.error("Erro no SQL:", err);
        return res
          .status(500)
          .json({ message: "Erro ao cadastrar. E-mail talvez já exista." });
      }
      res.status(201).json({ message: "Usuário criado com sucesso!" });
    });
  } catch (error) {
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// --- ROTA DE LOGIN (CORRIGIDA) ---
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const pool = db.getPool();

  if (!pool) {
    return res
      .status(500)
      .json({ message: "Servidor desconectado do banco de dados." });
  }

  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    pool.query(sql, [email], async (err, data) => {
      if (err) {
        console.error("Erro na consulta do banco:", err);
        return res
          .status(500)
          .json({ message: "Erro na consulta do servidor." });
      }

      if (data.length === 0) {
        console.log(`Tentativa de login: E-mail ${email} não encontrado.`);
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      // Validação da senha criptografada
      const match = await bcrypt.compare(password, data[0].password);

      if (!match) {
        return res.status(401).json({ message: "Senha incorreta." });
      }

      // Criação do token de sessão segura
      const token = jwt.sign(
        { id: data[0].id },
        process.env.JWT_SECRET || "CHAVE_RESERVA",
        { expiresIn: "1d" },
      );

      // Agora sim, enviamos a resposta apenas DEPOIS de validar tudo com sucesso!
      return res.json({
        message: "Login realizado com sucesso!",
        token: token,
        user: {
          name: data[0].name,
          email: data[0].email,
          role: data[0].role, // Informa se é client ou admin
        },
      });
    });
  } catch (error) {
    console.error("Erro interno no login:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// --- OUTRAS ROTAS ---
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

// ROTA DE SAÚDE (Para monitorar o status da aplicação)
app.get("/api/health", (req, res) => {
  res.json({ status: "API Beauty Hub está rodando", timestamp: new Date() });
});

// Rota raiz padrão para a API
app.get("/", (req, res) => {
  res.json({ message: "Beauty Hub API Ativa e Pronta", version: "1.0.0" });
});

// Inicialização estável do servidor no Render
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor pronto na porta ${PORT}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120500;
