import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const orderService = {
  getAll: (status) => client.get("/orders", { params: status ? { status } : {} }),
  getById: (id) => client.get(`/orders/${id}`),
  create: (data) => client.post("/orders", data),
  updateStatus: (id, orderStatus) => client.patch(`/orders/${id}/status`, { orderStatus }),
  cancel: (id) => client.delete(`/orders/${id}`),
};

export default orderService;