const express = require("express");
const router = express.Router();

// 1. LISTAR TODOS
router.get("/", async (req, res) => {
  try {
    const pool = req.db;
    const [rows] = await pool.query("SELECT * FROM professionals");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar" });
  }
});

// 2. CRIAR NOVO
router.post("/criar", async (req, res) => {
  const { name, description, image } = req.body;
  try {
    const pool = req.db;
    const [result] = await pool.execute(
      "INSERT INTO professionals (name, description, image) VALUES (?, ?, ?)",
      [name, description || "", image || ""],
    );
    res.status(201).json({ message: "Criado!", id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar" });
  }
});

// 3. ATUALIZAR (PUT)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, image } = req.body;
  try {
    const pool = req.db;
    await pool.execute(
      "UPDATE professionals SET name = ?, description = ?, image = ? WHERE id = ?",
      [name, description, image, id],
    );
    res.json({ message: "Atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});

// 4. DELETAR (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = req.db;
    await pool.execute("DELETE FROM professionals WHERE id = ?", [id]);
    res.json({ message: "Profissional removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar" });
  }
});

module.exports = router;
