const express = require("express");
const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [clientsResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = ?",
      ["client"],
    );

    const today = new Date().toISOString().split("T")[0];
    const [todayResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ? AND status = ?",
      [today, "confirmed"],
    );

    const [revenueResult] = await connection.execute(
      `SELECT SUM(total_price) as total FROM appointments 
       WHERE MONTH(appointment_date) = MONTH(NOW()) 
       AND YEAR(appointment_date) = YEAR(NOW())`,
    );

    connection.release();

    res.json({
      clientsCount: clientsResult[0]?.count || 0,
      appointmentsToday: todayResult[0]?.count || 0,
      revenueMonth: revenueResult[0]?.total || 0,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    res.status(500).json({ error: "Erro ao buscar dashboard" });
  }
});

router.get("/usuarios", async (req, res) => {
  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id, nome, email, telefone, created_at FROM users WHERE role = ?",
      ["client"],
    );

    connection.release();
    res.json(users || []);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.get("/agendamentos", async (req, res) => {
  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [appointments] = await connection.execute(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.total_price,
              a.client_name, a.service_name, a.professional_name
       FROM appointments a
       ORDER BY a.appointment_date DESC, a.appointment_time`,
    );

    connection.release();
    res.json(appointments || []);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

router.get("/faturamento/:mes/:ano", async (req, res) => {
  const { mes, ano } = req.params;

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    const [data] = await connection.execute(
      `SELECT DATE(a.appointment_date) as appointment_date, SUM(a.total_price) as daily_total, COUNT(*) as appointments_count
       FROM appointments a
       WHERE MONTH(a.appointment_date) = ? AND YEAR(a.appointment_date) = ?
       GROUP BY DATE(a.appointment_date)
       ORDER BY a.appointment_date`,
      [String(mes).padStart(2, "0"), ano],
    );

    connection.release();
    res.json(data || []);
  } catch (error) {
    console.error("Erro ao buscar faturamento:", error);
    res.status(500).json({ error: "Erro ao buscar faturamento" });
  }
});

router.delete("/usuario/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    await connection.execute("DELETE FROM appointments WHERE client_id = ?", [
      id,
    ]);

    await connection.execute("DELETE FROM users WHERE id = ?", [id]);

    connection.release();
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

router.put("/agendamento/:id/reverter", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = req.db;
    const connection = await pool.getConnection();

    await connection.execute(
      "UPDATE appointments SET status = ? WHERE id = ?",
      ["confirmed", id],
    );

    connection.release();
    res.json({ message: "Agendamento revertido com sucesso" });
  } catch (error) {
    console.error("Erro ao reverter agendamento:", error);
    res.status(500).json({ error: "Erro ao reverter agendamento" });
  }
});

module.exports = router;
