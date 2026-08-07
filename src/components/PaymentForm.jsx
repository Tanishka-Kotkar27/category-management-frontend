import React, { useState } from "react";

const PAYMENT_METHODS = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export default function PaymentForm({ orders, onSubmit, onCancel, submitting }) {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errors, setErrors] = useState({});

  const selectedOrder = orders.find((o) => o.orderId === Number(orderId));

  const handleOrderChange = (e) => {
    const id = e.target.value;
    setOrderId(id);
    const order = orders.find((o) => o.orderId === Number(id));
    if (order) {
      setAmount(order.totalAmount);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!orderId) newErrors.orderId = "Please select an order";
    if (amount === "" || isNaN(amount) || Number(amount) <= 0)
      newErrors.amount = "Amount must be a number greater than 0";
    if (!paymentMethod) newErrors.paymentMethod = "Please select a payment method";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      orderId: Number(orderId),
      amount: Number(amount),
      paymentMethod,
    });
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2>Process Payment</h2>

      <div className="form-group">
        <label htmlFor="orderId">Order *</label>
        <select id="orderId" value={orderId} onChange={handleOrderChange}>
          <option value="">Select an order</option>
          {orders.map((o) => (
            <option key={o.orderId} value={o.orderId}>
              Order #{o.orderId} — {o.customerName} — ${Number(o.totalAmount).toFixed(2)}
            </option>
          ))}
        </select>
        {errors.orderId && <span className="error-text">{errors.orderId}</span>}
      </div>

      {selectedOrder && (
        <div className="order-preview">
          <div className="order-preview-line">
            <span>Customer:</span> <strong>{selectedOrder.customerName}</strong>
          </div>
          <div className="order-preview-line">
            <span>Order Status:</span> <strong>{selectedOrder.orderStatus}</strong>
          </div>
          <div className="order-preview-line">
            <span>Items:</span>
            <span>
              {selectedOrder.items.map((it) => `${it.productName} × ${it.quantity}`).join(", ")}
            </span>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount *</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method *</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Select a method</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Processing..." : "Process Payment"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}