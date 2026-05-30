const express = require("express");
const router = express.Router();

// ROTA SETUP - cria tabelas (remover depois)
router.get("/setup", (req, res) => {
  const pool = req.db;

  const sql1 = `CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0.00
  )`;

  const sql2 = `CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    professional_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    total_price DECIMAL(10,2) DEFAULT 50.00,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
  )`;

  const sql3 = `INSERT IGNORE INTO services (id, name, type) VALUES (1, 'Corte e Beleza', 'beleza')`;

  pool.query(sql1, (err1) => {
    pool.query(sql2, (err2) => {
      pool.query(sql3, (err3) => {
        res.json({
          services: err1 ? err1.message : "OK",
          appointments: err2 ? err2.message : "OK",
          serviceInsert: err3 ? err3.message : "OK",
        });
      });
    });
  });
});

// Obter todos os agendamentos do usuário
router.get("/meus-agendamentos/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = req.db;
    const connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      `SELECT a.*, p.name as professional_name, s.type as service_type, s.name as service_name
       FROM appointments a
       JOIN professionals p ON a.professional_id = p.id
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC`,
      [userId],
    );
    connection.release();
    res.json(appointments || []);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

// Criar novo agendamento
router.post("/criar", (req, res) => {
  const {
    user_id,
    professional_id,
    service_id,
    appointment_date,
    appointment_time,
    total_price,
  } = req.body;
  const pool = req.db;

  if (
    !user_id ||
    !professional_id ||
    !service_id ||
    !appointment_date ||
    !appointment_time
  ) {
    return res.status(400).json({ error: "Campos obrigatórios faltando." });
  }

  if (!pool) {
    return res
      .status(500)
      .json({ error: "Conexão com o banco de dados não disponível." });
  }

  const sql = `INSERT INTO appointments 
    (user_id, professional_id, service_id, appointment_date, appointment_time, total_price, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`;

  const valores = [
    user_id,
    professional_id,
    service_id,
    appointment_date,
    appointment_time,
    total_price || 50.0,
  ];

  pool.query(sql, valores, (err, result) => {
    if (err) {
      console.error("Erro ao inserir agendamento no MySQL:", err);
      return res.status(500).json({
        error: "Erro interno ao salvar no banco de dados.",
        detalhe: err.message,
        codigo: err.code,
      });
    }
    return res.status(201).json({
      message: "Agendamento realizado com sucesso!",
      id: result.insertId,
    });
  });
});

// Obter agendamentos de um dia (para admin)
router.get("/dia/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const pool = req.db;
    const connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      `SELECT a.*, p.name as professional_name, u.nome as client_name, s.type as service_type, s.name as service_name
       FROM appointments a
       JOIN professionals p ON a.professional_id = p.id
       JOIN users u ON a.user_id = u.id
       JOIN services s ON a.service_id = s.id
       WHERE a.appointment_date = ?
       ORDER BY a.appointment_time`,
      [date],
    );
    connection.release();
    res.json(appointments || []);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

// Cancelar agendamento
router.put("/cancelar/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const pool = req.db;
    const connection = await pool.getConnection();
    await connection.execute(
      "UPDATE appointments SET status = ? WHERE id = ?",
      ["cancelled", appointmentId],
    );
    connection.release();
    res.json({ message: "Agendamento cancelado com sucesso" });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    res.status(500).json({ error: "Erro ao cancelar agendamento" });
  }
});

// Horários disponíveis
router.get("/horarios-disponiveis/:professionalId/:date", async (req, res) => {
  const { professionalId, date } = req.params;
  const availableHours = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];
  try {
    const pool = req.db;
    const connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      "SELECT appointment_time FROM appointments WHERE professional_id = ? AND appointment_date = ?",
      [professionalId, date],
    );
    connection.release();
    const bookedTimes = appointments.map((a) => a.appointment_time);
    const available = availableHours.filter(
      (hour) => !bookedTimes.includes(hour),
    );
    res.json({ availableHours: available });
  } catch (error) {
    console.error("Erro ao buscar horários:", error);
    res.status(500).json({ error: "Erro ao buscar horários" });
  }
});

module.exports = router;
