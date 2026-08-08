import React, { useState, useEffect } from "react";

const DISCOUNT_TYPES = [
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" },
];

function toDateTimeLocal(value) {
  if (!value) return "";
  return value.slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

export default function CouponForm({ initialData, categories, products, onSubmit, onCancel, submitting }) {
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [applicableCategoryId, setApplicableCategoryId] = useState("");
  const [applicableProductId, setApplicableProductId] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setCouponCode(initialData.couponCode || "");
      setDiscountType(initialData.discountType || "PERCENTAGE");
      setDiscountValue(initialData.discountValue ?? "");
      setValidFrom(toDateTimeLocal(initialData.validFrom));
      setValidTo(toDateTimeLocal(initialData.validTo));
      setUsageLimit(initialData.usageLimit ?? "");
      setMinOrderAmount(initialData.minOrderAmount ?? "");
      setApplicableCategoryId(initialData.applicableCategoryId ?? "");
      setApplicableProductId(initialData.applicableProductId ?? "");
    } else {
      setCouponCode("");
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setValidFrom("");
      setValidTo("");
      setUsageLimit("");
      setMinOrderAmount("");
      setApplicableCategoryId("");
      setApplicableProductId("");
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!couponCode.trim()) newErrors.couponCode = "Coupon code is required";
    else if (couponCode.length > 50) newErrors.couponCode = "Must be at most 50 characters";

    if (discountValue === "" || isNaN(discountValue) || Number(discountValue) <= 0)
      newErrors.discountValue = "Must be a number greater than 0";
    if (discountType === "PERCENTAGE" && Number(discountValue) > 100)
      newErrors.discountValue = "Percentage cannot exceed 100";

    if (!validFrom) newErrors.validFrom = "Start date is required";
    if (!validTo) newErrors.validTo = "End date is required";
    if (validFrom && validTo && new Date(validTo) <= new Date(validFrom))
      newErrors.validTo = "End date must be after start date";

    if (usageLimit !== "" && (isNaN(usageLimit) || Number(usageLimit) <= 0))
      newErrors.usageLimit = "Must be a positive number";

    if (minOrderAmount !== "" && (isNaN(minOrderAmount) || Number(minOrderAmount) < 0))
      newErrors.minOrderAmount = "Cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      couponCode: couponCode.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      validFrom: new Date(validFrom).toISOString().slice(0, 19),
      validTo: new Date(validTo).toISOString().slice(0, 19),
      usageLimit: usageLimit === "" ? null : Number(usageLimit),
      minOrderAmount: minOrderAmount === "" ? null : Number(minOrderAmount),
      applicableCategoryId: applicableCategoryId === "" ? null : Number(applicableCategoryId),
      applicableProductId: applicableProductId === "" ? null : Number(applicableProductId),
    });
  };

  return (
    <form className="coupon-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Coupon" : "Create New Coupon"}</h2>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="couponCode">Coupon Code *</label>
          <input
            id="couponCode"
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            maxLength={50}
            placeholder="e.g. SAVE20"
            style={{ textTransform: "uppercase" }}
          />
          {errors.couponCode && <span className="error-text">{errors.couponCode}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="discountType">Discount Type *</label>
          <select id="discountType" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
            {DISCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="discountValue">
            Discount Value * {discountType === "PERCENTAGE" ? "(%)" : "($)"}
          </label>
          <input
            id="discountValue"
            type="number"
            step="0.01"
            min="0"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 10.00"}
          />
          {errors.discountValue && <span className="error-text">{errors.discountValue}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="usageLimit">Usage Limit</label>
          <input
            id="usageLimit"
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited if blank"
          />
          {errors.usageLimit && <span className="error-text">{errors.usageLimit}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="validFrom">Valid From *</label>
          <input
            id="validFrom"
            type="datetime-local"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
          {errors.validFrom && <span className="error-text">{errors.validFrom}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="validTo">Valid To *</label>
          <input
            id="validTo"
            type="datetime-local"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
          />
          {errors.validTo && <span className="error-text">{errors.validTo}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="minOrderAmount">Minimum Order Amount</label>
        <input
          id="minOrderAmount"
          type="number"
          step="0.01"
          min="0"
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
          placeholder="No minimum if blank"
        />
        {errors.minOrderAmount && <span className="error-text">{errors.minOrderAmount}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="applicableCategoryId">Limit to Category</label>
          <select
            id="applicableCategoryId"
            value={applicableCategoryId}
            onChange={(e) => setApplicableCategoryId(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="applicableProductId">Limit to Product</label>
          <select
            id="applicableProductId"
            value={applicableProductId}
            onChange={(e) => setApplicableProductId(e.target.value)}
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.productName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Coupon" : "Create Coupon"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}