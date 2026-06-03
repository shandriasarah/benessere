require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const https = require("https");
const Database = require("./database/init");

// 1️⃣ PRIMEIRO: Criar o app
const app = express();
const PORT = process.env.PORT || 3000;

// 2️⃣ DEPOIS: Configurar CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.header("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 3️⃣ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4️⃣ Banco de dados
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectTimeout: 60000,
  ssl: { rejectUnauthorized: false },
};

const db = new Database(dbConfig);
db.init()
  .then(() => console.log("Banco de dados conectado com sucesso!"))
  .catch((err) => console.error("Erro ao inicializar banco de dados:", err));

app.use((req, res, next) => {
  req.db = db.getPool();
  next();
});

// 5️⃣ Static files
app.use(express.static(path.join(__dirname, "../public")));

// 6️⃣ Rotas de autenticação diretas (se existirem)
app.post("/api/auth/register", async (req, res) => {
  // ... seu código
});

app.post("/api/auth/login", async (req, res) => {
  // ... seu código
});

// 7️⃣ Rotas dos arquivos
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const professionalsRoutes = require("./routes/professionals");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/clients");

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

// 8️⃣ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API Beauty Hub está rodando", timestamp: new Date() });
});

// 9️⃣ Fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// 🔟 Auto-ping (manter Render acordado)
setInterval(
  () => {
    https
      .get("https://beauty-hub-72cv.onrender.com/api/health", () => {
        console.log("Auto-ping enviado");
      })
      .on("error", () => {});
  },
  14 * 60 * 1000,
);

// 1️⃣1️⃣ Iniciar servidor
const server = app.listen(PORT, () =>
  console.log(`Servidor pronto na porta ${PORT}`),
);
server.keepAliveTimeout = 120000;
server.headersTimeout = 120500;
