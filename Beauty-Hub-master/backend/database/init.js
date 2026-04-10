const mysql = require("mysql2/promise");

class Database {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async init() {
    try {
      const connection = await mysql.createConnection({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        port: this.config.port || 24756,
        connectTimeout: 60000,
      });

      await connection.execute(
        `CREATE DATABASE IF NOT EXISTS ${this.config.database}`,
      );
      console.log(
        `✅ Banco de dados '${this.config.database}' verificado/criado`,
      );

      await connection.end();

      this.pool = await mysql.createPool({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port || 24756,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      console.log("✅ Conectado ao banco de dados MySQL");
      await this.createTables();
    } catch (err) {
      console.error("❌ Erro ao conectar ao banco de dados:", err);
      throw err;
    }
  }

  async createTables() {
    const connection = await this.pool.getConnection();

    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          telefone VARCHAR(20) NOT NULL,
          senha VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'client',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user VARCHAR(255) UNIQUE NOT NULL,
          senha VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS professionals (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          description LONGTEXT,
          image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS services (
          id INT PRIMARY KEY AUTO_INCREMENT,
          professional_id INT NOT NULL,
          type VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          duration INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
          KEY idx_professional (professional_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          professional_id INT NOT NULL,
          service_id INT NOT NULL,
          appointment_date DATE NOT NULL,
          appointment_time TIME NOT NULL,
          status VARCHAR(50) DEFAULT 'confirmed',
          total_price DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
          KEY idx_user (user_id),
          KEY idx_professional (professional_id),
          KEY idx_date (appointment_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      await this.insertDefaultData(connection);
    } catch (err) {
      console.error("Erro ao criar tabelas:", err);
    } finally {
      connection.release();
    }
  }

  async insertDefaultData(connection) {
    try {
      const [professionals] = await connection.execute(
        "SELECT COUNT(*) as count FROM professionals",
      );

      if (professionals[0].count === 0) {
        await connection.execute(
          `
          INSERT INTO professionals (name, description, image) VALUES 
          (?, ?, ?),
          (?, ?, ?)
        `,
          [
            "Marília Andrade",
            "Quem sou eu: <br> Esteticista",
            "img/marilia.jpg",
            "João Silva",
            "Quem sou eu: <br> Especialista",
            "img/foto.jpg",
          ],
        );

        await connection.execute(
          `
          INSERT INTO services (professional_id, type, name, price, duration) VALUES 
          (1, ?, ?, ?, ?),
          (1, ?, ?, ?, ?),
          (1, ?, ?, ?, ?),
          (1, ?, ?, ?, ?),
          (1, ?, ?, ?, ?),
          (2, ?, ?, ?, ?)
        `,
          [
            "Corte",
            "Simples",
            80.0,
            45,
            "Corte",
            "Avançado",
            120.0,
            70,
            "Manicure",
            "Simples",
            40.0,
            30,
            "Cílios",
            "Clássico",
            120.0,
            90,
            "Cílios",
            "Volume Russo",
            150.0,
            120,
            "Barba",
            "Simples",
            40.0,
            20,
          ],
        );

        console.log("✅ Dados padrão inseridos com sucesso");
      }

      const [admins] = await connection.execute(
        "SELECT COUNT(*) as count FROM admins",
      );

      if (admins[0].count === 0) {
        await connection.execute(
          "INSERT INTO admins (user, senha) VALUES (?, ?)",
          ["admin", "1234"],
        );
        console.log("✅ Admin padrão criado: user: admin, password: 1234");
      }
    } catch (err) {
      console.error("Erro ao inserir dados padrão:", err);
    }
  }

  getPool() {
    return this.pool;
  }
}

module.exports = Database;
