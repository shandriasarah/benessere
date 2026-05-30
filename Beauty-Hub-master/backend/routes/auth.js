const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Login Cliente
router.post("/login-cliente", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ? AND senha = ? AND role = ?",
      [email.toLowerCase(), senha, "client"],
    );

    connection.release();

    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
      },
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// Login Admin
router.post("/login-admin", async (req, res) => {
  const { user, senha } = req.body;

  if (!user || !senha) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
  }

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [admins] = await connection.execute(
      "SELECT * FROM admins WHERE user = ? AND senha = ?",
      [user, senha],
    );

    connection.release();

    if (!admins || admins.length === 0) {
      return res.status(401).json({ error: "Usuário ou senha incorretos" });
    }

    const admin = admins[0];
    const token = jwt.sign(
      { id: admin.id, user: admin.user, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: { id: admin.id, user: admin.user },
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});
// Rota temporária para criar admin - REMOVER DEPOIS
router.get("/criar-admin", (req, res) => {
  const bcrypt = require("bcrypt");
  const pool = req.db;

  bcrypt.hash("admin123", 10, (err, hash) => {
    if (err) return res.status(500).json({ error: err.message });

    pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE role = 'admin'",
      ["Admin", "admin@beautyhub.com", hash, "admin"],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({
          ok: true,
          message: "Admin criado!",
          email: "admin@beautyhub.com",
          senha: "admin123",
        });
      },
    );
  });
});

// Cadastro Cliente
router.post("/cadastro-cliente", async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !telefone || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase()],
    );

    if (existingUsers && existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const [result] = await connection.execute(
      "INSERT INTO users (nome, email, telefone, senha, role) VALUES (?, ?, ?, ?, ?)",
      [nome, email.toLowerCase(), telefone, senha, "client"],
    );

    connection.release();

    res.status(201).json({
      message: "Cadastro realizado com sucesso",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.json({ message: "Logout realizado com sucesso" });
});
// Rota para criar tabela admins e inserir admin padrão - REMOVER DEPOIS
router.get("/setup-admin", (req, res) => {
  const pool = req.db;

  pool.query(
    `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
  )`,
    (err1) => {
      if (err1) return res.status(500).json({ error: err1.message });

      pool.query(
        "INSERT IGNORE INTO admins (user, senha) VALUES (?, ?)",
        ["admin", "admin123"],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ ok: true, user: "admin", senha: "admin123" });
        },
      );
    },
  );
});

module.exports = router;
