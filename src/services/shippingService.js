import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const shippingService = {
  calculateCost: (data) => client.post("/shipping/calculate", data),
  create: (data) => client.post("/shipping", data),
  getAll: () => client.get("/shipping"),
  getByOrderId: (orderId) => client.get(`/shipping/order/${orderId}`),
  trackByNumber: (trackingNumber) => client.get(`/shipping/track/${trackingNumber}`),
  update: (shippingId, data) => client.patch(`/shipping/${shippingId}`, data),
};

export default shippingService;