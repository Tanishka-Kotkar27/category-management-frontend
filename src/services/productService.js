import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const productService = {
  getAll: () => client.get("/products"),
  getById: (id) => client.get(`/products/${id}`),
  create: (data) => client.post("/products", data),
  update: (id, data) => client.put(`/products/${id}`, data),
  deactivate: (id) => client.delete(`/products/${id}`),
  activate: (id) => client.patch(`/products/${id}/activate`),
};

export default productService;