const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = req.db;
    const [professionals] = await pool.execute("SELECT * FROM professionals WHERE ativo = 1");

    // Buscar serviços de cada profissional
    for (const prof of professionals) {
      const [services] = await pool.execute(
        `SELECT s.id, s.nome as name, s.preco as price, s.duracao
         FROM professional_services ps
         JOIN services s ON ps.service_id = s.id
         WHERE ps.professional_id = ?`,
        [prof.id]
      );
      prof.servicos = services;
    }

    res.json(professionals || []);
  } catch (err) {
    console.error("Erro ao buscar profissionais:", err);
    res.status(500).json({ error: "Erro ao buscar profissionais." });
  }
});

router.post("/criar", async (req, res) => {
  const { nome, especialidade, telefone } = req.body;
  try {
    const pool = req.db;
    const [result] = await pool.execute(
      "INSERT INTO professionals (nome, especialidade, telefone) VALUES (?, ?, ?)",
      [nome, especialidade || "", telefone || ""]
    );
    res.status(201).json({ message: "Criado!", id: result.insertId });
  } catch (err) {
    console.error("Erro ao criar profissional:", err);
    res.status(500).json({ error: "Erro ao criar profissional." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, especialidade, telefone } = req.body;
  try {
    const pool = req.db;
    await pool.execute(
      "UPDATE professionals SET nome = ?, especialidade = ?, telefone = ? WHERE id = ?",
      [nome, especialidade, telefone, id]
    );
    res.json({ message: "Atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar profissional:", err);
    res.status(500).json({ error: "Erro ao atualizar." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = req.db;
    await pool.execute("UPDATE professionals SET ativo = 0 WHERE id = ?", [id]);
    res.json({ message: "Profissional removido com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar profissional:", err);
    res.status(500).json({ error: "Erro ao deletar." });
  }
});

module.exports = router;
