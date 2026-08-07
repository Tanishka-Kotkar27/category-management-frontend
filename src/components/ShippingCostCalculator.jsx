import React, { useState } from "react";
import shippingService from "../services/shippingService";

const ZONES = ["LOCAL", "REGIONAL", "NATIONAL"];
const METHODS = ["STANDARD", "EXPRESS", "OVERNIGHT"];

export default function ShippingCostCalculator() {
  const [weightKg, setWeightKg] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("LOCAL");
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!weightKg || Number(weightKg) <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    setCalculating(true);
    try {
      const res = await shippingService.calculateCost({
        weightKg: Number(weightKg),
        deliveryZone,
        shippingMethod,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate shipping cost.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="cost-calculator-card">
      <h3>Shipping Cost Calculator</h3>
      <form onSubmit={handleCalculate}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weightKg">Weight (kg)</label>
            <input
              id="weightKg"
              type="number"
              step="0.1"
              min="0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 2.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryZone">Delivery Zone</label>
            <select
              id="deliveryZone"
              value={deliveryZone}
              onChange={(e) => setDeliveryZone(e.target.value)}
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z.charAt(0) + z.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="shippingMethod">Shipping Method</label>
            <select
              id="shippingMethod"
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0) + m.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={calculating}>
          {calculating ? "Calculating..." : "Calculate Cost"}
        </button>
      </form>

      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="cost-result">
          <div className="cost-result-amount">${Number(result.shippingCost).toFixed(2)}</div>
          <div className="cost-result-breakdown">{result.breakdown}</div>
        </div>
      )}
    </div>
  );
}