import React, { useEffect, useState } from "react";
import orderService from "../services/orderService";
import productService from "../services/productService";
import OrderForm from "./OrderForm";
import ConfirmModal from "./ConfirmModal";

const STATUS_OPTIONS = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchOrders = async (status) => {
    setLoading(true);
    setError("");
    try {
      const res = await orderService.getAll(status || undefined);
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data.filter((p) => p.status && p.inventoryCount > 0));
    } catch (err) {
      setError("Failed to load products for placing orders.");
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOrders(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    if (products.length === 0) {
      setError("No products in stock available. Please add products before placing an order.");
      return;
    }
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await orderService.create(data);
      flashSuccess("Order placed successfully");
      closeForm();
      fetchOrders(statusFilter);
      fetchProducts(); // refresh stock counts
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    setError("");
    try {
      await orderService.updateStatus(order.orderId, newStatus);
      flashSuccess(`Order #${order.orderId} status updated to ${newStatus}`);
      fetchOrders(statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    }
  };

  const requestCancel = (order) => {
    setPendingCancelId(order.orderId);
    setConfirmConfig({
      title: "Cancel Order",
      message: `Are you sure you want to cancel Order #${order.orderId}? Stock will be restored.`,
      isWarning: true,
      confirmLabel: "Cancel Order",
    });
  };

  const runCancel = async () => {
    const id = pendingCancelId;
    setConfirmConfig(null);
    setError("");
    try {
      await orderService.cancel(id);
      flashSuccess("Order cancelled successfully");
      setPendingCancelId(null);
      fetchOrders(statusFilter);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order.");
      setPendingCancelId(null);
    }
  };

  const cancelCancel = () => {
    setPendingCancelId(null);
    setConfirmConfig(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Order Management</h1>
          <p className="subtitle">View, track, and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Place Order
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <label htmlFor="statusFilter">Filter by status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Shipping Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className={!order.status ? "row-inactive" : ""}>
                <td>#{order.orderId}</td>
                <td>{order.customerName}</td>
                <td>
                  {order.items.map((it) => (
                    <div key={it.orderItemId} className="order-item-line">
                      {it.productName} × {it.quantity}
                    </div>
                  ))}
                </td>
                <td>${Number(order.totalAmount).toFixed(2)}</td>
                <td>{order.shippingAddress || "—"}</td>
                <td>
                  <span className={`badge status-${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="actions-cell">
                  {order.orderStatus === "PENDING" && (
                    <>
                      <button
                        className="btn btn-small"
                        onClick={() => handleStatusChange(order, "SHIPPED")}
                      >
                        Mark Shipped
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => requestCancel(order)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.orderStatus === "SHIPPED" && (
                    <button
                      className="btn btn-small"
                      onClick={() => handleStatusChange(order, "DELIVERED")}
                    >
                      Mark Delivered
                    </button>
                  )}
                  {(order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED") && (
                    <span className="text-muted">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-wide">
            <OrderForm
              products={products}
              onSubmit={handleFormSubmit}
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
          onConfirm={runCancel}
          onCancel={cancelCancel}
        />
      )}
    </div>
  );
}