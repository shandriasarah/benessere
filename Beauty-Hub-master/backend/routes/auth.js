const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Login Cliente
router.post('/login-cliente', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const pool = req.db;
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND senha = ? AND role = ?',
      [email.toLowerCase(), senha, 'client']
    );
    
    connection.release();

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, nome: user.nome, email: user.email, telefone: user.telefone }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Login Admin
router.post('/login-admin', async (req, res) => {
  const { user, senha } = req.body;

  if (!user || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  try {
    const pool = req.db;
    const connection = await pool.getConnection();
    
    const [admins] = await connection.execute(
      'SELECT * FROM admins WHERE user = ? AND senha = ?',
      [user, senha]
    );
    
    connection.release();

    if (!admins || admins.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const admin = admins[0];
    const token = jwt.sign(
      { id: admin.id, user: admin.user, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: admin.id, user: admin.user }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Cadastro Cliente
router.post('/cadastro-cliente', async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !telefone || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUsers && existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const [result] = await connection.execute(
      'INSERT INTO users (nome, email, telefone, senha, role) VALUES (?, ?, ?, ?, ?)',
      [nome, email.toLowerCase(), telefone, senha, 'client']
    );

    connection.release();

    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = router;
