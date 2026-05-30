require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const Database = require("./database/init");

// Importação das Rotas Externas
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const professionalsRoutes = require("./routes/professionals");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/clients");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARES CONFIGURADOS NO TOPO (ESSENCIAL)
// ==========================================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json()); // Ensina o servidor a ler os dados enviados pelo JavaScript
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. CONFIGURAÇÃO E CONEXÃO DO BANCO DE DADOS
// ==========================================
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
  .then(() => console.log(" Banco de dados conectado com sucesso!"))
  .catch((err) => {
    console.error(" Erro ao inicializar banco de dados:", err);
  });

// Middleware que injeta a conexão do banco em cada requisição
app.use((req, res, next) => {
  req.db = db.getPool();
  next();
});

// ==========================================
// 3. DISTRIBUIÇÃO DOS ARQUIVOS ESTÁTICOS (FRONT-END)
// ==========================================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../public")));

// ==========================================
// 4. ROTAS DA API
// ==========================================

// Rotas internas direto no server.js
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const pool = db.getPool();

  if (!pool)
    return res.status(500).json({ message: "Servidor conectando ao banco..." });

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

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const pool = db.getPool();

  if (!pool)
    return res
      .status(500)
      .json({ message: "Servidor desconectado do banco de dados." });

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
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const match = await bcrypt.compare(password, data[0].password);
      if (!match) return res.status(401).json({ message: "Senha incorreta." });

      const token = jwt.sign(
        { id: data[0].id },
        process.env.JWT_SECRET || "CHAVE_RESERVA",
        { expiresIn: "1d" },
      );

      return res.json({
        message: "Login realizado com sucesso!",
        token: token,
        user: {
          id: data[0].id, // Garante que o ID do usuário seja retornado para salvar no sessionStorage!
          name: data[0].name,
          email: data[0].email,
          role: data[0].role,
        },
      });
    });
  } catch (error) {
    console.error("Erro interno no login:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Vinculando as rotas externas (Chamando apenas UMA vez no lugar certo)
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API Beauty Hub está rodando", timestamp: new Date() });
});

// Rota coringa para entrega segura de páginas no Render (Evita erro ENOENT)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, "index.html"), (err2) => {
        if (err2) {
          res.status(200).json({
            status: "Servidor ativo!",
            message: "Beauty Hub API rodando perfeitamente.",
          });
        }
      });
    }
  });
});

// Inicialização estável do servidor
const server = app.listen(PORT, () => {
  console.log(` Servidor pronto na porta ${PORT}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120500;
