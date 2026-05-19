const express = require("express");
const router = express.Router();

// --- BUSCAR TODOS OS PROFISSIONAIS ---
router.get("/", async (req, res) => {
  const pool = req.db;

  if (!pool) {
    return res
      .status(500)
      .json({ error: "Conexão com o banco não disponível." });
  }

  // Ajustado para usar o formato padrão de query por callback do seu projeto
  pool.query("SELECT * FROM professionals", (err, results) => {
    if (err) {
      console.error("Erro ao buscar profissionais no banco:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar no banco de dados." });
    }

    // Devolve a lista direta dos profissionais cadastrados
    return res.json(results);
  });
});

// --- CRIAR PROFISSIONAL ---
router.post("/criar", async (req, res) => {
  const { name, description, image } = req.body;
  const pool = req.db;

  if (!pool) {
    return res
      .status(500)
      .json({ error: "Conexão com o banco não disponível." });
  }

  const sql =
    "INSERT INTO professionals (name, description, image) VALUES (?, ?, ?)";
  pool.query(sql, [name, description || "", image || ""], (err, result) => {
    if (err) {
      console.error("Erro ao criar profissional:", err);
      return res.status(500).json({ error: "Erro ao criar profissional." });
    }
    return res.status(201).json({ message: "Criado!", id: result.insertId });
  });
});

// --- ATUALIZAR PROFISSIONAL ---
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, image } = req.body;
  const pool = req.db;

  const sql =
    "UPDATE professionals SET name = ?, description = ?, image = ? WHERE id = ?";
  pool.query(sql, [name, description, image, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar profissional:", err);
      return res.status(500).json({ error: "Erro ao atualizar." });
    }
    return res.json({ message: "Atualizado com sucesso" });
  });
});

// --- DELETAR PROFISSIONAL ---
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const pool = req.db;

  const sql = "DELETE FROM professionals WHERE id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Erro ao deletar profissional:", err);
      return res.status(500).json({ error: "Erro ao deletar." });
    }
    return res.json({ message: "Profissional removido com sucesso" });
  });
});

module.exports = router;
