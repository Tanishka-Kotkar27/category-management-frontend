import React, { useState } from "react";
import shippingService from "../services/shippingService";

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setSearching(true);
    try {
      const res = await shippingService.trackByNumber(trackingNumber.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Tracking number not found.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="track-shipment-card">
      <h3>Track Your Shipment</h3>
      <form onSubmit={handleTrack} className="track-form-row">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
        />
        <button type="submit" className="btn btn-primary" disabled={searching}>
          {searching ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="track-result">
          <div className="track-result-row">
            <span>Order</span> <strong>#{result.orderId}</strong>
          </div>
          <div className="track-result-row">
            <span>Courier</span> <strong>{result.courierService || "—"}</strong>
          </div>
          <div className="track-result-row">
            <span>Status</span>
            <span className={`badge shipping-status-${result.shippingStatus.toLowerCase()}`}>
              {result.shippingStatus.replace("_", " ")}
            </span>
          </div>
          <div className="track-result-row">
            <span>Shipping To</span> <strong>{result.shippingAddress || "—"}</strong>
          </div>
        </div>
      )}
    </div>
  );
}