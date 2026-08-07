import React, { useEffect, useState } from "react";
import shippingService from "../services/shippingService";
import orderService from "../services/orderService";
import ShippingCreateForm from "./ShippingCreateForm";
import ShippingCostCalculator from "./ShippingCostCalculator";
import TrackShipment from "./TrackShipment";

const STATUS_OPTIONS = ["PENDING", "SHIPPED", "IN_TRANSIT", "DELIVERED"];

export default function ShippingDashboard() {
  const [shippingRecords, setShippingRecords] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const fetchShipping = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await shippingService.getAll();
      setShippingRecords(res.data);
    } catch (err) {
      setError("Failed to load shipping records. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders.");
    }
  };

  useEffect(() => {
    fetchShipping();
    fetchOrders();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    if (orders.length === 0) {
      setError("No orders available. Please place an order before creating a shipping record.");
      return;
    }
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleCreateSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await shippingService.create(data);
      flashSuccess("Shipping record created successfully");
      closeForm();
      fetchShipping();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shipping record.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (record) => {
    setEditingId(record.shippingId);
    setEditValues({
      courierService: record.courierService || "",
      trackingNumber: record.trackingNumber || "",
      shippingStatus: record.shippingStatus,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (shippingId) => {
    setError("");
    try {
      await shippingService.update(shippingId, editValues);
      flashSuccess("Shipping details updated successfully");
      setEditingId(null);
      fetchShipping();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update shipping details.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Shipping Management</h1>
          <p className="subtitle">Track shipments and manage courier details</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Create Shipping Record
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="shipping-tools-row">
        <ShippingCostCalculator />
        <TrackShipment />
      </div>

      {loading ? (
        <p>Loading shipping records...</p>
      ) : shippingRecords.length === 0 ? (
        <p>No shipping records yet. Click "Create Shipping Record" to add one for an order.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Courier</th>
              <th>Tracking #</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shippingRecords.map((r) =>
              editingId === r.shippingId ? (
                <tr key={r.shippingId}>
                  <td>#{r.orderId}</td>
                  <td>{r.customerName}</td>
                  <td>{r.shippingAddress || "—"}</td>
                  <td>
                    <input
                      type="text"
                      value={editValues.courierService}
                      onChange={(e) =>
                        setEditValues((v) => ({ ...v, courierService: e.target.value }))
                      }
                      className="inline-edit-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editValues.trackingNumber}
                      onChange={(e) =>
                        setEditValues((v) => ({ ...v, trackingNumber: e.target.value }))
                      }
                      className="inline-edit-input"
                    />
                  </td>
                  <td>
                    <select
                      value={editValues.shippingStatus}
                      onChange={(e) =>
                        setEditValues((v) => ({ ...v, shippingStatus: e.target.value }))
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>${Number(r.shippingCost).toFixed(2)}</td>
                  <td className="actions-cell">
                    <button className="btn btn-small btn-primary" onClick={() => saveEdit(r.shippingId)}>
                      Save
                    </button>
                    <button className="btn btn-small btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={r.shippingId}>
                  <td>#{r.orderId}</td>
                  <td>{r.customerName}</td>
                  <td>{r.shippingAddress || "—"}</td>
                  <td>{r.courierService || "—"}</td>
                  <td className="mono-text">{r.trackingNumber || "—"}</td>
                  <td>
                    <span className={`badge shipping-status-${r.shippingStatus.toLowerCase()}`}>
                      {r.shippingStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td>${Number(r.shippingCost).toFixed(2)}</td>
                  <td className="actions-cell">
                    <button className="btn btn-small" onClick={() => startEdit(r)}>
                      Edit
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-wide">
            <ShippingCreateForm
              orders={orders}
              onSubmit={handleCreateSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}