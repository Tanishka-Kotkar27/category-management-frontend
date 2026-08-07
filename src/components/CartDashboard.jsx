import React, { useEffect, useState } from "react";
import cartService from "../services/cartService";
import customerService from "../services/customerService";
import productService from "../services/productService";
import CartAddForm from "./CartAddForm";
import ConfirmModal from "./ConfirmModal";

export default function CartDashboard() {
  const [carts, setCarts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchCarts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cartService.getAll();
      setCarts(res.data);
    } catch (err) {
      setError("Failed to load carts. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportingData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        customerService.getAll(),
        productService.getAll(),
      ]);
      setCustomers(customersRes.data.filter((c) => c.status));
      setProducts(productsRes.data.filter((p) => p.status && p.inventoryCount > 0));
    } catch (err) {
      setError("Failed to load customers/products.");
    }
  };

  useEffect(() => {
    fetchCarts();
    fetchSupportingData();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openAddForm = () => {
    if (customers.length === 0 || products.length === 0) {
      setError("Need at least one active customer and one in-stock product to add a cart item.");
      return;
    }
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleAddSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await cartService.addToCart(data);
      flashSuccess("Item added to cart");
      closeForm();
      fetchCarts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to cart.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuantityChange = async (cartItem, newQuantity) => {
    if (newQuantity <= 0) return;
    setError("");
    try {
      await cartService.updateQuantity(cartItem.cartId, newQuantity);
      fetchCarts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity.");
    }
  };

  const requestRemove = (cartItem) => {
    setPendingRemoveId(cartItem.cartId);
    setConfirmConfig({
      title: "Remove from Cart",
      message: `Remove "${cartItem.productName}" from ${cartItem.customerName}'s cart?`,
      isWarning: false,
      confirmLabel: "Remove",
    });
  };

  const runRemove = async () => {
    const id = pendingRemoveId;
    setConfirmConfig(null);
    setError("");
    try {
      await cartService.remove(id);
      flashSuccess("Item removed from cart");
      setPendingRemoveId(null);
      fetchCarts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item.");
      setPendingRemoveId(null);
    }
  };

  const cancelRemove = () => {
    setPendingRemoveId(null);
    setConfirmConfig(null);
  };

  // Group cart rows by customer for the admin abandonment-analysis view
  const groupedByCustomer = carts.reduce((acc, item) => {
    const key = item.customerId;
    if (!acc[key]) {
      acc[key] = { customerName: item.customerName, items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const customerGroups = Object.entries(groupedByCustomer);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Cart Management</h1>
          <p className="subtitle">View all customer carts and monitor abandoned items</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          + Add to Cart
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading carts...</p>
      ) : customerGroups.length === 0 ? (
        <p>No items in any cart right now.</p>
      ) : (
        <div className="cart-groups">
          {customerGroups.map(([customerId, group]) => {
            const groupTotal = group.items.reduce(
              (sum, item) => sum + Number(item.totalPrice),
              0
            );
            return (
              <div key={customerId} className="cart-group-card">
                <div className="cart-group-header">
                  <h3>{group.customerName}</h3>
                  <span className="cart-group-total">${groupTotal.toFixed(2)}</span>
                </div>
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={item.cartId}>
                        <td>{item.productName}</td>
                        <td>${Number(item.unitPrice).toFixed(2)}</td>
                        <td>
                          <div className="qty-stepper">
                            <button
                              type="button"
                              className="btn btn-small"
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              className="btn btn-small"
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>${Number(item.totalPrice).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            onClick={() => requestRemove(item)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-wide">
            <CartAddForm
              customers={customers}
              products={products}
              onSubmit={handleAddSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {confirmConfig && (
        <ConfirmModal
          title={confirmConfig.title}
          message={confirmConfig.message}
          isWarning={confirmConfig.isWarning}
          confirmLabel={confirmConfig.confirmLabel}
          onConfirm={runRemove}
          onCancel={cancelRemove}
        />
      )}
    </div>
  );
}