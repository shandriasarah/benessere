const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = req.db;
    const [results] = await pool.execute("SELECT * FROM services WHERE ativo = 1 ORDER BY nome");
    res.json(results || []);
  } catch (err) {
    console.error("Erro ao buscar serviços:", err);
    res.status(500).json({ error: "Erro ao buscar serviços." });
  }
});

module.exports = router;
