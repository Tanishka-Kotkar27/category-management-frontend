import React, { useEffect, useState } from "react";
import customerService from "../services/customerService";
import CustomerForm from "./CustomerForm";
import ConfirmModal from "./ConfirmModal";

export default function CustomerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingDeactivateId, setPendingDeactivateId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await customerService.getAll();
      setCustomers(res.data);
    } catch (err) {
      setError("Failed to load customers. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.userId, data);
        flashSuccess("Customer updated successfully");
      } else {
        await customerService.create(data);
        flashSuccess("Customer created successfully");
      }
      closeForm();
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (customer) => {
    setPendingDeactivateId(customer.userId);
    setConfirmConfig({
      title: "Deactivate Customer",
      message: `Are you sure you want to deactivate ${customer.firstName} ${customer.lastName || ""}'s account? Their data will be kept, but the account will be marked inactive.`,
      isWarning: true,
      confirmLabel: "Deactivate",
    });
  };

  const runDeactivate = async () => {
    const id = pendingDeactivateId;
    setConfirmConfig(null);
    setError("");
    try {
      await customerService.deactivate(id);
      flashSuccess("Customer account deactivated successfully");
      setPendingDeactivateId(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate customer.");
      setPendingDeactivateId(null);
    }
  };

  const cancelDeactivate = () => {
    setPendingDeactivateId(null);
    setConfirmConfig(null);
  };

  const handleActivate = async (customer) => {
    setError("");
    try {
      await customerService.activate(customer.userId);
      flashSuccess("Customer account reactivated successfully");
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate customer.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Customer Management</h1>
          <p className="subtitle">View and manage customer accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Customer
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers yet. Click "Add Customer" to create your first one.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.userId} className={!c.status ? "row-inactive" : ""}>
                <td>{c.firstName} {c.lastName || ""}</td>
                <td>{c.email || "—"}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.orderCount}</td>
                <td>
                  <span className={`badge ${c.status ? "badge-active" : "badge-inactive"}`}>
                    {c.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-small" onClick={() => openEditForm(c)}>
                    Edit
                  </button>
                  {c.status ? (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => requestDeactivate(c)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button className="btn btn-small" onClick={() => handleActivate(c)}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <CustomerForm
              initialData={editingCustomer}
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
          onConfirm={runDeactivate}
          onCancel={cancelDeactivate}
        />
      )}
    </div>
  );
}