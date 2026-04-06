const express = require("express");
const router = express.Router();

router.get("/perfil/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id, nome, email, telefone, created_at FROM users WHERE id = ? AND role = ?",
      [id, "client"],
    );

    connection.release();

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

router.put("/perfil/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email } = req.body;

  if (!nome && !telefone && !email) {
    return res.status(400).json({ error: "Nenhum campo para atualizar" });
  }

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    let updateFields = [];
    let values = [];

    if (nome) {
      updateFields.push("nome = ?");
      values.push(nome);
    }
    if (telefone) {
      updateFields.push("telefone = ?");
      values.push(telefone);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email.toLowerCase());
    }

    values.push(id);
    values.push("client");

    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ? AND role = ?`;

    await connection.execute(query, values);
    connection.release();

    res.json({ message: "Perfil atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

router.get("/agendamentos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [appointments] = await connection.execute(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.total_price,
              p.name as professional_name, s.type as service_type, s.name as service_name
       FROM appointments a
       JOIN professionals p ON a.professional_id = p.id
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [id],
    );

    connection.release();
    res.json(appointments || []);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

module.exports = router;
