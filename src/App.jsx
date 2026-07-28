import React, { useState } from "react";
import CategoryDashboard from "./components/CategoryDashboard";
import ProductDashboard from "./components/ProductDashboard";
import OrderDashboard from "./components/OrderDashboard";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="App">
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "categories" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={`tab-btn ${activeTab === "products" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      {activeTab === "categories" && <CategoryDashboard />}
      {activeTab === "products" && <ProductDashboard />}
      {activeTab === "orders" && <OrderDashboard />}
    </div>
  );
}

export default App;