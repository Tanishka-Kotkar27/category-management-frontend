import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const wishlistService = {
  getByCustomer: (customerId) => client.get("/wishlist", { params: { customerId } }),
  addToWishlist: (data) => client.post("/wishlist", data),
  remove: (wishlistId) => client.delete(`/wishlist/${wishlistId}`),
  moveToCart: (wishlistId, quantity = 1) =>
    client.post(`/wishlist/${wishlistId}/move-to-cart`, { quantity }),
};

export default wishlistService;