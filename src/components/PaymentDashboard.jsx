import React, { useEffect, useState } from "react";
import paymentService from "../services/paymentService";
import orderService from "../services/orderService";
import PaymentForm from "./PaymentForm";
import ConfirmModal from "./ConfirmModal";

export default function PaymentDashboard() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingRefundId, setPendingRefundId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await paymentService.getAll();
      setPayments(res.data);
    } catch (err) {
      setError("Failed to load payments. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders for processing payments.");
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchOrders();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    if (orders.length === 0) {
      setError("No orders available. Please place an order before processing a payment.");
      return;
    }
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await paymentService.process(data);
      flashSuccess("Payment processed successfully");
      closeForm();
      fetchPayments();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const requestRefund = (payment) => {
    setPendingRefundId(payment.paymentId);
    setConfirmConfig({
      title: "Issue Refund",
      message: `Refund $${Number(payment.amount).toFixed(2)} for payment #${payment.paymentId} (Order #${payment.orderId})? This can only be done for cancelled orders.`,
      isWarning: true,
      confirmLabel: "Issue Refund",
    });
  };

  const runRefund = async () => {
    const id = pendingRefundId;
    setConfirmConfig(null);
    setError("");
    try {
      await paymentService.refund(id);
      flashSuccess("Refund issued successfully");
      setPendingRefundId(null);
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue refund.");
      setPendingRefundId(null);
    }
  };

  const cancelRefund = () => {
    setPendingRefundId(null);
    setConfirmConfig(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Payment Management</h1>
          <p className="subtitle">Process payments and view transaction history</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Process Payment
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading payments...</p>
      ) : payments.length === 0 ? (
        <p>No payments yet. Click "Process Payment" to record your first transaction.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Transaction Ref</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentId}>
                <td>#{p.paymentId}</td>
                <td>#{p.orderId}</td>
                <td>{p.customerName}</td>
                <td>${Number(p.amount).toFixed(2)}</td>
                <td>{p.paymentMethod.replace("_", " ")}</td>
                <td className="mono-text">{p.transactionReference || "—"}</td>
                <td>
                  <span className={`badge payment-status-${p.paymentStatus.toLowerCase()}`}>
                    {p.paymentStatus}
                  </span>
                </td>
                <td className="actions-cell">
                  {p.paymentStatus === "PAID" ? (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => requestRefund(p)}
                    >
                      Refund
                    </button>
                  ) : (
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
            <PaymentForm
              orders={orders}
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
          onConfirm={runRefund}
          onCancel={cancelRefund}
        />
      )}
    </div>
  );
}