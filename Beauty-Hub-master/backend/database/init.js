const mysql = require("mysql2");

class Database {
  constructor(config) {
    this.config = config;
    // Criamos o pool IMEDIATAMENTE no construtor.
    // Assim, o getPool() nunca retornará nulo.
    this.pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 20000, // 20 segundos para esperar o Aiven
    });

    console.log(" Pool de conexões MySQL criado.");
  }

  async init() {
    // Apenas testa se a conexão está funcionando
    try {
      const connection = await this.pool.promise().getConnection();
      console.log("✅ Conexão com o banco Aiven validada!");
      connection.release();
    } catch (err) {
      console.error("⏳ Banco ainda aquecendo ou erro de config:", err.message);
      // Não lançamos erro aqui para não derrubar o servidor
    }
  }

  getPool() {
    return this.pool;
  }
}

module.exports = Database;
