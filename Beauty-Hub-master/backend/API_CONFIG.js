/**
 * Configuração da API Backend
 * Arquivo: js/api-config.js
 * Descrição: Centraliza as URLs da API para facilitar integração
 */

const API_CONFIG = {
  // URL base da API
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://beauty-hub-72cv.onrender.com/api"
      : "http://localhost:3000/api",

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN_CLIENTE: "/auth/login-cliente",
      LOGIN_ADMIN: "/auth/login-admin",
      CADASTRO_CLIENTE: "/auth/cadastro-cliente",
      LOGOUT: "/auth/logout",
    },
    APPOINTMENTS: {
      CRIAR: "/appointments/criar",
      MEUS_AGENDAMENTOS: "/appointments/meus-agendamentos",
      DIA: "/appointments/dia",
      HORARIOS_DISPONIVEIS: "/appointments/horarios-disponiveis",
      CANCELAR: "/appointments/cancelar",
    },
    PROFESSIONALS: {
      LISTAR: "/professionals",
      OBTER: "/professionals",
      CRIAR: "/professionals/criar",
    },
    ADMIN: {
      DASHBOARD: "/admin/dashboard",
      USUARIOS: "/admin/usuarios",
      AGENDAMENTOS: "/admin/agendamentos",
      FATURAMENTO: "/admin/faturamento",
      EXCLUIR_USUARIO: "/admin/usuario",
      REVERTER_AGENDAMENTO: "/admin/agendamento",
    },
    CLIENTS: {
      PERFIL: "/clients/perfil",
      AGENDAMENTOS: "/clients/agendamentos",
    },
  },

  /**
   * Fazer requisição GET
   */
  async get(endpoint, userId = null) {
    const url = userId
      ? `${this.BASE_URL}${endpoint}/${userId}`
      : `${this.BASE_URL}${endpoint}`;
    const token = sessionStorage.getItem("token");

    const options = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error("Erro na requisição GET:", error);
      throw error;
    }
  },

  /**
   * Fazer requisição POST
   */
  async post(endpoint, data) {
    const url = `${this.BASE_URL}${endpoint}`;
    const token = sessionStorage.getItem("token");

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error("Erro na requisição POST:", error);
      throw error;
    }
  },

  /**
   * Fazer requisição PUT
   */
  async put(endpoint, data, id = null) {
    const url = id
      ? `${this.BASE_URL}${endpoint}/${id}`
      : `${this.BASE_URL}${endpoint}`;
    const token = sessionStorage.getItem("token");

    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error("Erro na requisição PUT:", error);
      throw error;
    }
  },

  /**
   * Fazer requisição DELETE
   */
  async delete(endpoint, id) {
    const url = `${this.BASE_URL}${endpoint}/${id}`;
    const token = sessionStorage.getItem("token");

    const options = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error("Erro na requisição DELETE:", error);
      throw error;
    }
  },

  /**
   * Verificar se usuário está logado
   */
  isLoggedIn() {
    return !!sessionStorage.getItem("token");
  },

  /**
   * Obter usuário armazenado
   */
  getUser() {
    const user = sessionStorage.getItem("tb_logged");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Obter token
   */
  getToken() {
    return sessionStorage.getItem("token");
  },
};

// Exportar para uso em outros arquivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = API_CONFIG;
}
