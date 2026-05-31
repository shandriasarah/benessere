require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const https = require("https");
const Database = require("./database/init");

const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const professionalsRoutes = require("./routes/professionals");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/clients");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - único bloco
app.use("*", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  .then(() => console.log("Banco de dados conectado com sucesso!"))
  .catch((err) => console.error("Erro ao inicializar banco de dados:", err));

app.use((req, res, next) => {
  req.db = db.getPool();
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../public")));

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const pool = db.getPool();
  if (!pool)
    return res.status(500).json({ message: "Servidor conectando ao banco..." });
  try {
    const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashPassword],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Erro ao cadastrar. E-mail talvez já exista." });
        res.status(201).json({ message: "Usuário criado com sucesso!" });
      },
    );
  } catch {
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const pool = db.getPool();
  if (!pool) return res.status(500).json({ message: "Servidor desconectado." });
  try {
    pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, data) => {
        if (err) return res.status(500).json({ message: "Erro na consulta." });
        if (data.length === 0)
          return res.status(404).json({ message: "Usuário não encontrado." });
        const match = await bcrypt.compare(password, data[0].password);
        if (!match)
          return res.status(401).json({ message: "Senha incorreta." });
        const token = jwt.sign(
          { id: data[0].id },
          process.env.JWT_SECRET || "CHAVE_RESERVA",
          { expiresIn: "1d" },
        );
        return res.json({
          message: "Login realizado com sucesso!",
          token,
          user: {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            role: data[0].role,
          },
        });
      },
    );
  } catch {
    res.status(500).json({ message: "Erro interno." });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/professionals", professionalsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API Beauty Hub está rodando", timestamp: new Date() });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
    if (err)
      res.sendFile(path.join(__dirname, "index.html"), (err2) => {
        if (err2)
          res
            .status(200)
            .json({
              status: "Servidor ativo!",
              message: "Beauty Hub API rodando perfeitamente.",
            });
      });
  });
});

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

const server = app.listen(PORT, () =>
  console.log(`Servidor pronto na porta ${PORT}`),
);
server.keepAliveTimeout = 120000;
server.headersTimeout = 120500;
