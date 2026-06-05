const express = require("express");
const router = express.Router();

router.get("/perfil/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = req.db;
    const [rows] = await pool.execute(
      "SELECT id, nome, email, telefone, endereco, data_nascimento FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/perfil/:userId", async (req, res) => {
  const { userId } = req.params;
  const { nome, name, telefone, phone, address, endereco, birth_date, data_nascimento } = req.body;
  try {
    const pool = req.db;
    await pool.execute(
      "UPDATE users SET nome = ?, telefone = ?, endereco = ?, data_nascimento = ? WHERE id = ?",
      [
        nome || name || "",
        telefone || phone || "",
        endereco || address || null,
        data_nascimento || birth_date || null,
        userId
      ]
    );
    res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
