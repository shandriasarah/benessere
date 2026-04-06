const express = require("express");
const router = express.Router();

router.get("/perfil/:id", async (req, res) => {
  const { id } = req.params;
  const pool = req.db;
  let connection;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT id, nome, email, telefone, created_at FROM users WHERE id = ? AND role = ?",
      [id, "client"],
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  } finally {
    if (connection) connection.release();
  }
});

router.put("/perfil/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email } = req.body;
  const pool = req.db;
  let connection;

  if (!nome && !telefone && !email) {
    return res.status(400).json({ error: "Nenhum campo para atualizar" });
  }

  const fields = [];
  const values = [];

  if (nome) {
    fields.push("nome = ?");
    values.push(nome);
  }
  if (telefone) {
    fields.push("telefone = ?");
    values.push(telefone);
  }
  if (email) {
    fields.push("email = ?");
    values.push(email.toLowerCase());
  }

  values.push(id, "client");

  try {
    connection = await pool.getConnection();
    await connection.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ? AND role = ?`,
      values,
    );

    res.json({ message: "Perfil atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  } finally {
    if (connection) connection.release();
  }
});

router.get("/agendamentos/:id", async (req, res) => {
  const { id } = req.params;
  const pool = req.db;
  let connection;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT
         a.id,
         a.appointment_date,
         a.appointment_time,
         a.status,
         a.total_price,
         p.name  AS professional_name,
         s.type  AS service_type,
         s.name  AS service_name
       FROM appointments a
       JOIN professionals p ON a.professional_id = p.id
       JOIN services      s ON a.service_id      = s.id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [id],
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar agendamentos:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
