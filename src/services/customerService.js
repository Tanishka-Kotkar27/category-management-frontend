import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const customerService = {
  getAll: () => client.get("/customers"),
  getById: (id) => client.get(`/customers/${id}`),
  create: (data) => client.post("/customers", data),
  update: (id, data) => client.put(`/customers/${id}`, data),
  deactivate: (id) => client.delete(`/customers/${id}`),
  activate: (id) => client.patch(`/customers/${id}/activate`),
};

export default customerService;