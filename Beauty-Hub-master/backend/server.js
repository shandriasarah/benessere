require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Database = require("./database/init");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const professionalsRoutes = require("./routes/professionals");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/clients");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "beauty_hub",
  port: process.env.DB_PORT || 24756,
  connectTimeout: 60000,
};

const db = new Database(dbConfig);
db.init().catch((err) => {
  console.error("Erro ao inicializar banco de dados:", err);
  process.exit(1);
});

app.use((req, res, next) => {
  req.db = db.getPool();
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API Beauty Hub está rodando", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.json({
    message: "Beauty Hub API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      appointments: "/api/appointments",
      professionals: "/api/professionals",
      admin: "/api/admin",
      clients: "/api/clients",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Erro:", err);
  res
    .status(500)
    .json({ error: "Erro interno do servidor", message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Beauty Hub Backend rodando em http://localhost:${PORT}`);
  console.log(
    `📱 Acesse http://localhost:${PORT}/api/health para verificar status`,
  );
});

module.exports = app;
