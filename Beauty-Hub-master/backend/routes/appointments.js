const express = require("express");
const router = express.Router();

// Criar novo agendamento
router.post("/criar", async (req, res) => {
  const { client_id, client_name, professional_id, professional_name, service_id, service_name, appointment_date, appointment_time, total_price } = req.body;
  const pool = req.db;

  if (!appointment_date || !appointment_time) {
    return res.status(400).json({ error: "Campos obrigatórios faltando." });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO appointments (client_id, client_name, professional_id, professional_name, service_id, service_name, appointment_date, appointment_time, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [client_id || null, client_name || "", professional_id || null, professional_name || "", service_id || null, service_name || "", appointment_date, appointment_time, total_price || 0]
    );
    res.status(201).json({ message: "Agendamento realizado com sucesso!", id: result.insertId });
  } catch (err) {
    console.error("Erro ao criar agendamento:", err);
    res.status(500).json({ error: "Erro ao salvar agendamento.", detalhe: err.message });
  }
});

// Meus agendamentos por cliente
router.get("/meus-agendamentos/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = req.db;
    const [appointments] = await pool.execute(
      `SELECT * FROM appointments WHERE client_id = ? ORDER BY appointment_date DESC`,
      [userId]
    );
    res.json(appointments || []);
  } catch (err) {
    console.error("Erro ao buscar agendamentos:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

// Agendamentos de um dia
router.get("/dia/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const pool = req.db;
    const [appointments] = await pool.execute(
      `SELECT * FROM appointments WHERE appointment_date = ? ORDER BY appointment_time`,
      [date]
    );
    res.json(appointments || []);
  } catch (err) {
    console.error("Erro ao buscar agendamentos:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

// Cancelar agendamento
router.put("/cancelar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = req.db;
    await pool.execute("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [id]);
    res.json({ message: "Agendamento cancelado com sucesso" });
  } catch (err) {
    console.error("Erro ao cancelar agendamento:", err);
    res.status(500).json({ error: "Erro ao cancelar agendamento" });
  }
});

// Editar agendamento
router.put("/editar/:id", async (req, res) => {
  const { id } = req.params;
  const { appointment_date, appointment_time } = req.body;
  try {
    const pool = req.db;
    await pool.execute(
      "UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = 'scheduled' WHERE id = ?",
      [appointment_date, appointment_time, id]
    );
    res.json({ message: "Agendamento atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Horários disponíveis
router.get("/horarios-disponiveis/:professionalId/:date", async (req, res) => {
  const { professionalId, date } = req.params;
  const allHours = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
  try {
    const pool = req.db;
    const [appointments] = await pool.execute(
      "SELECT appointment_time FROM appointments WHERE professional_id = ? AND appointment_date = ? AND status != 'cancelled'",
      [professionalId, date]
    );
    const booked = appointments.map((a) => String(a.appointment_time).substring(0, 5));
    const available = allHours.filter((h) => !booked.includes(h));
    res.json({ availableHours: available });
  } catch (err) {
    console.error("Erro ao buscar horários:", err);
    res.status(500).json({ error: "Erro ao buscar horários" });
  }
});

module.exports = router;
