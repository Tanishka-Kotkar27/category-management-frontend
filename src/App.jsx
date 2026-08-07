import React, { useState } from "react";
import CategoryDashboard from "./components/CategoryDashboard";
import ProductDashboard from "./components/ProductDashboard";
import OrderDashboard from "./components/OrderDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import PaymentDashboard from "./components/PaymentDashboard";
import CartDashboard from "./components/CartDashboard";
import WishlistDashboard from "./components/WishlistDashboard";
import ShippingDashboard from "./components/ShippingDashboard";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="App">
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === "categories" ? "tab-active" : ""}`} onClick={() => setActiveTab("categories")}>
          Categories
        </button>
        <button className={`tab-btn ${activeTab === "products" ? "tab-active" : ""}`} onClick={() => setActiveTab("products")}>
          Products
        </button>
        <button className={`tab-btn ${activeTab === "orders" ? "tab-active" : ""}`} onClick={() => setActiveTab("orders")}>
          Orders
        </button>
        <button className={`tab-btn ${activeTab === "customers" ? "tab-active" : ""}`} onClick={() => setActiveTab("customers")}>
          Customers
        </button>
        <button className={`tab-btn ${activeTab === "payments" ? "tab-active" : ""}`} onClick={() => setActiveTab("payments")}>
          Payments
        </button>
        <button className={`tab-btn ${activeTab === "cart" ? "tab-active" : ""}`} onClick={() => setActiveTab("cart")}>
          Carts
        </button>
        <button className={`tab-btn ${activeTab === "wishlist" ? "tab-active" : ""}`} onClick={() => setActiveTab("wishlist")}>
          Wishlist
        </button>
        <button className={`tab-btn ${activeTab === "shipping" ? "tab-active" : ""}`} onClick={() => setActiveTab("shipping")}>
          Shipping
        </button>
      </div>

      {activeTab === "categories" && <CategoryDashboard />}
      {activeTab === "products" && <ProductDashboard />}
      {activeTab === "orders" && <OrderDashboard />}
      {activeTab === "customers" && <CustomerDashboard />}
      {activeTab === "payments" && <PaymentDashboard />}
      {activeTab === "cart" && <CartDashboard />}
      {activeTab === "wishlist" && <WishlistDashboard />}
      {activeTab === "shipping" && <ShippingDashboard />}
    </div>
  );
}

export default App;