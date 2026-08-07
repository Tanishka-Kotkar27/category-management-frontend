import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const paymentService = {
  getAll: () => client.get("/payments"),
  getById: (id) => client.get(`/payments/${id}`),
  process: (data) => client.post("/payments", data),
  refund: (id) => client.patch(`/payments/${id}/refund`),
};

export default paymentService;