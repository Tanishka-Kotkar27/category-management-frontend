import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const reviewService = {
  getAll: () => client.get("/reviews"),
  getApprovedForProduct: (productId) => client.get(`/reviews/product/${productId}`),
  getAllForProduct: (productId) => client.get(`/reviews/product/${productId}/all`),
  getRatingSummary: (productId) => client.get(`/reviews/product/${productId}/summary`),
  add: (data) => client.post("/reviews", data),
  update: (reviewId, customerId, data) =>
    client.put(`/reviews/${reviewId}`, data, { params: { customerId } }),
  deleteOwn: (reviewId, customerId) =>
    client.delete(`/reviews/${reviewId}`, { params: { customerId } }),
  approve: (reviewId) => client.patch(`/reviews/${reviewId}/approve`),
  reject: (reviewId) => client.patch(`/reviews/${reviewId}/reject`),
  deleteByAdmin: (reviewId) => client.delete(`/reviews/${reviewId}/admin`),
};

export default reviewService;