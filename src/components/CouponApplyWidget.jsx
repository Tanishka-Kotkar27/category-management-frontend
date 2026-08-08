import React, { useState } from "react";
import couponService from "../services/couponService";

export default function CouponApplyWidget() {
  const [couponCode, setCouponCode] = useState("");
  const [orderTotal, setOrderTotal] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!couponCode.trim() || !orderTotal || Number(orderTotal) <= 0) {
      setError("Please enter a coupon code and a valid order total");
      return;
    }

    setApplying(true);
    try {
      const res = await couponService.apply({
        couponCode: couponCode.trim().toUpperCase(),
        orderTotal: Number(orderTotal),
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply coupon.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="coupon-apply-card">
      <h3>Apply Coupon at Checkout</h3>
      <form onSubmit={handleApply} className="form-row">
        <div className="form-group">
          <label htmlFor="applyCouponCode">Coupon Code</label>
          <input
            id="applyCouponCode"
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="e.g. SAVE20"
            style={{ textTransform: "uppercase" }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="applyOrderTotal">Order Total</label>
          <input
            id="applyOrderTotal"
            type="number"
            step="0.01"
            min="0"
            value={orderTotal}
            onChange={(e) => setOrderTotal(e.target.value)}
            placeholder="e.g. 100.00"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={applying} style={{ alignSelf: "flex-end" }}>
          {applying ? "Applying..." : "Apply"}
        </button>
      </form>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="coupon-result">
          <div className="coupon-result-row">
            <span>Original Total</span> <span>${Number(result.originalTotal).toFixed(2)}</span>
          </div>
          <div className="coupon-result-row coupon-result-discount">
            <span>Discount ({result.couponCode})</span>
            <span>-${Number(result.discountAmount).toFixed(2)}</span>
          </div>
          <div className="coupon-result-row coupon-result-final">
            <span>Final Total</span> <span>${Number(result.finalTotal).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}