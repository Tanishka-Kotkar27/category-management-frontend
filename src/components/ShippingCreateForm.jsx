import React, { useState } from "react";

export default function ShippingCreateForm({ orders, onSubmit, onCancel, submitting }) {
  const [orderId, setOrderId] = useState("");
  const [courierService, setCourierService] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!orderId) newErrors.orderId = "Please select an order";
    if (shippingCost === "" || isNaN(shippingCost) || Number(shippingCost) < 0)
      newErrors.shippingCost = "Shipping cost must be 0 or greater";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      orderId: Number(orderId),
      courierService: courierService.trim(),
      trackingNumber: trackingNumber.trim(),
      shippingCost: Number(shippingCost),
    });
  };

  return (
    <form className="shipping-create-form" onSubmit={handleSubmit}>
      <h2>Create Shipping Record</h2>

      <div className="form-group">
        <label htmlFor="orderId">Order *</label>
        <select id="orderId" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
          <option value="">Select an order</option>
          {orders.map((o) => (
            <option key={o.orderId} value={o.orderId}>
              Order #{o.orderId} — {o.customerName} — {o.shippingAddress || "no address"}
            </option>
          ))}
        </select>
        {errors.orderId && <span className="error-text">{errors.orderId}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="courierService">Courier Service</label>
          <input
            id="courierService"
            type="text"
            value={courierService}
            onChange={(e) => setCourierService(e.target.value)}
            maxLength={100}
            placeholder="e.g. FedEx, UPS, DHL"
          />
        </div>

        <div className="form-group">
          <label htmlFor="trackingNumber">Tracking Number</label>
          <input
            id="trackingNumber"
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            maxLength={100}
            placeholder="e.g. FX123456789"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="shippingCost">Shipping Cost *</label>
        <input
          id="shippingCost"
          type="number"
          step="0.01"
          min="0"
          value={shippingCost}
          onChange={(e) => setShippingCost(e.target.value)}
          placeholder="0.00"
        />
        {errors.shippingCost && <span className="error-text">{errors.shippingCost}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create Shipping Record"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}