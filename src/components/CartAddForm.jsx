import React, { useState } from "react";

export default function CartAddForm({ customers, products, onSubmit, onCancel, submitting }) {
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});

  const selectedProduct = products.find((p) => p.productId === Number(productId));

  const validate = () => {
    const newErrors = {};
    if (!customerId) newErrors.customerId = "Please select a customer";
    if (!productId) newErrors.productId = "Please select a product";
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (selectedProduct && Number(quantity) > selectedProduct.inventoryCount) {
      newErrors.quantity = `Only ${selectedProduct.inventoryCount} in stock`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      customerId: Number(customerId),
      productId: Number(productId),
      quantity: Number(quantity),
    });
  };

  return (
    <form className="cart-add-form" onSubmit={handleSubmit}>
      <h2>Add Item to Cart</h2>

      <div className="form-group">
        <label htmlFor="customerId">Customer *</label>
        <select id="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Select a customer</option>
          {customers.map((c) => (
            <option key={c.userId} value={c.userId}>
              {c.firstName} {c.lastName || ""}
            </option>
          ))}
        </select>
        {errors.customerId && <span className="error-text">{errors.customerId}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="productId">Product *</label>
          <select id="productId" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.productName} — ${Number(p.price).toFixed(2)} ({p.inventoryCount} in stock)
              </option>
            ))}
          </select>
          {errors.productId && <span className="error-text">{errors.productId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity *</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {errors.quantity && <span className="error-text">{errors.quantity}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Adding..." : "Add to Cart"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}