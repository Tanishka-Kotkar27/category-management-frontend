import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const cartService = {
  getAll: () => client.get("/cart"),
  getByCustomer: (customerId) => client.get("/cart", { params: { customerId } }),
  addToCart: (data) => client.post("/cart", data),
  updateQuantity: (cartId, quantity) => client.put(`/cart/${cartId}`, { quantity }),
  remove: (cartId) => client.delete(`/cart/${cartId}`),
};

export default cartService;