const express = require("express");
const router = express.Router();

router.get("/perfil/:userId", (req, res) => {
  const { userId } = req.params;
  const pool = req.db;
  pool.query(
    "SELECT id, name, email, phone, address, birth_date FROM users WHERE id = ?",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0)
        return res.status(404).json({ error: "Usuário não encontrado" });
      res.json(rows[0]);
    },
  );
});

router.put("/perfil/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, phone, address, birth_date } = req.body;
  const pool = req.db;
  pool.query(
    "UPDATE users SET name = ?, phone = ?, address = ?, birth_date = ? WHERE id = ?",
    [name, phone, address, birth_date, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Perfil atualizado com sucesso!" });
    },
  );
});

router.get("/migrar2", (req, res) => {
  const pool = req.db;
  const resultados = {};

  pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20)", (err) => {
    resultados.phone = err ? err.message : "OK";
    pool.query("ALTER TABLE users ADD COLUMN address VARCHAR(255)", (err2) => {
      resultados.address = err2 ? err2.message : "OK";
      pool.query("ALTER TABLE users ADD COLUMN birth_date DATE", (err3) => {
        resultados.birth_date = err3 ? err3.message : "OK";
        res.json(resultados);
      });
    });
  });
});

router.get("/migrar", (req, res) => {
  const pool = req.db;
  pool.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
    () => {
      pool.query(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255)",
        () => {
          pool.query(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE",
            () => {
              res.json({ ok: true });
            },
          );
        },
      );
    },
  );
});

module.exports = router;
