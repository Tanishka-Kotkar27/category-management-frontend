import React, { useState } from "react";

export default function OrderForm({ products, onSubmit, onCancel, submitting }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [cartItems, setCartItems] = useState([]); // { productId, quantity }
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [errors, setErrors] = useState({});

  const addToCart = () => {
    if (!selectedProductId) return;
    const productId = Number(selectedProductId);
    const quantity = Number(selectedQuantity);

    if (quantity <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });

    setSelectedProductId("");
    setSelectedQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const getProduct = (productId) => products.find((p) => p.productId === productId);

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  const validate = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    else if (customerName.length > 150) newErrors.customerName = "Must be at most 150 characters";

    if (cartItems.length === 0) newErrors.cart = "Please add at least one product to the order";
    if (shippingAddress.length > 300) newErrors.shippingAddress = "Must be at most 300 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      shippingAddress: shippingAddress.trim(),
      items: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h2>Place New Order</h2>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="customerName">Customer Name *</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            maxLength={150}
            placeholder="e.g. John Smith"
          />
          {errors.customerName && <span className="error-text">{errors.customerName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="customerEmail">Customer Email</label>
          <input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            maxLength={150}
            placeholder="optional"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="shippingAddress">Shipping Address</label>
        <textarea
          id="shippingAddress"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Street, city, state, zip"
        />
        {errors.shippingAddress && <span className="error-text">{errors.shippingAddress}</span>}
      </div>

      <div className="cart-builder">
        <label>Add Products to Cart</label>
        <div className="form-row">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.productName} — ${Number(p.price).toFixed(2)} ({p.inventoryCount} in stock)
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(e.target.value)}
            style={{ width: "80px" }}
          />
          <button type="button" className="btn btn-secondary" onClick={addToCart}>
            Add
          </button>
        </div>
      </div>

      {errors.cart && <span className="error-text">{errors.cart}</span>}

      {cartItems.length > 0 && (
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => {
              const product = getProduct(item.productId);
              return (
                <tr key={item.productId}>
                  <td>{product?.productName}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(product?.price).toFixed(2)}</td>
                  <td>${(Number(product?.price) * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: 600 }}>
                Total
              </td>
              <td style={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}