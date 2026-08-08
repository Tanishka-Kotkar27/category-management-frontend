import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const couponService = {
  getAll: () => client.get("/coupons"),
  getById: (id) => client.get(`/coupons/${id}`),
  create: (data) => client.post("/coupons", data),
  update: (id, data) => client.put(`/coupons/${id}`, data),
  deactivate: (id) => client.patch(`/coupons/${id}/deactivate`),
  activate: (id) => client.patch(`/coupons/${id}/activate`),
  remove: (id) => client.delete(`/coupons/${id}`),
  apply: (data) => client.post("/coupons/apply", data),
};

export default couponService;