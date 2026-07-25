import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const categoryService = {
  getAll: () => client.get("/categories"),
  getById: (id) => client.get(`/categories/${id}`),
  create: (data) => client.post("/categories", data),
  update: (id, data) => client.put(`/categories/${id}`, data),
  deactivate: (id, force = false) =>
    client.delete(`/categories/${id}`, { params: { force } }),
  activate: (id) => client.patch(`/categories/${id}/activate`),
};

export default categoryService;