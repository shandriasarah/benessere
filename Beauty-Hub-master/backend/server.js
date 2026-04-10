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
    console.error("❌ Erro ao inicializar banco de dados:", err);
    // Não vamos matar o processo imediatamente para o Render não dar 502 de cara
  });

// Middleware para passar o pool do banco para as rotas
app.use((req, res, next) => {
  req.db = db.getPool();
  next();
});

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

// --- ROTA DE LOGIN ---
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const pool = db.getPool();
  const sql = "SELECT * FROM users WHERE email = ?";

  pool.query(sql, [email], async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json({ message: "Usuário não encontrado." });

    const match = await bcrypt.compare(password, data[0].password);
    if (!match) return res.status(401).json({ message: "Senha incorreta." });

    const token = jwt.sign(
      { id: data[0].id },
      process.env.JWT_SECRET || "CHAVE_RESERVA",
      {
        expiresIn: "1d",
      },
    );

    res.json({
      message: "Login realizado!",
      token: token,
      name: data[0].name,
    });
  });
});

// --- OUTRAS ROTAS ---
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

// ROTA DE SAÚDE (Para você testar no navegador)
app.get("/api/health", (req, res) => {
  res.json({ status: "API Beauty Hub está rodando", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.json({ message: "Beauty Hub API Ativa", version: "1.0.0" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
