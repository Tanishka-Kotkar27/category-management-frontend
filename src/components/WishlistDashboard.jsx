import React, { useEffect, useState } from "react";
import wishlistService from "../services/wishlistService";
import customerService from "../services/customerService";
import productService from "../services/productService";
import WishlistAddForm from "./WishlistAddForm";
import ConfirmModal from "./ConfirmModal";

export default function WishlistDashboard() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchSupportingData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        customerService.getAll(),
        productService.getAll(),
      ]);
      setCustomers(customersRes.data.filter((c) => c.status));
      setProducts(productsRes.data.filter((p) => p.status));
    } catch (err) {
      setError("Failed to load customers/products.");
    }
  };

  const fetchWishlist = async (customerId) => {
    if (!customerId) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await wishlistService.getByCustomer(customerId);
      setWishlistItems(res.data);
    } catch (err) {
      setError("Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportingData();
  }, []);

  useEffect(() => {
    fetchWishlist(selectedCustomerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId]);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openAddForm = () => {
    if (customers.length === 0 || products.length === 0) {
      setError("Need at least one customer and one product to add a wishlist item.");
      return;
    }
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleAddSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await wishlistService.addToWishlist(data);
      flashSuccess("Item added to wishlist");
      closeForm();
      if (String(data.customerId) === String(selectedCustomerId)) {
        fetchWishlist(selectedCustomerId);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to wishlist.");
    } finally {
      setSubmitting(false);
    }
  };

  const requestRemove = (item) => {
    setPendingRemoveId(item.wishlistId);
    setConfirmConfig({
      title: "Remove from Wishlist",
      message: `Remove "${item.productName}" from this wishlist?`,
      isWarning: false,
      confirmLabel: "Remove",
    });
  };

  const runRemove = async () => {
    const id = pendingRemoveId;
    setConfirmConfig(null);
    setError("");
    try {
      await wishlistService.remove(id);
      flashSuccess("Item removed from wishlist");
      setPendingRemoveId(null);
      fetchWishlist(selectedCustomerId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item.");
      setPendingRemoveId(null);
    }
  };

  const cancelRemove = () => {
    setPendingRemoveId(null);
    setConfirmConfig(null);
  };

  const handleMoveToCart = async (item) => {
    setError("");
    try {
      await wishlistService.moveToCart(item.wishlistId, 1);
      flashSuccess(`"${item.productName}" moved to cart`);
      fetchWishlist(selectedCustomerId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to move item to cart.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Wishlist Management</h1>
          <p className="subtitle">View and manage customer wishlists</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          + Add to Wishlist
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <label htmlFor="customerSelect">Viewing wishlist for:</label>
        <select
          id="customerSelect"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">Select a customer</option>
          {customers.map((c) => (
            <option key={c.userId} value={c.userId}>
              {c.firstName} {c.lastName || ""}
            </option>
          ))}
        </select>
      </div>

      {!selectedCustomerId ? (
        <p>Select a customer above to view their wishlist.</p>
      ) : loading ? (
        <p>Loading wishlist...</p>
      ) : wishlistItems.length === 0 ? (
        <p>This customer's wishlist is empty.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Added On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wishlistItems.map((item) => (
              <tr key={item.wishlistId}>
                <td>{item.productName}</td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>
                  <span className={`badge ${item.inStock ? "badge-active" : "badge-inactive"}`}>
                    {item.inStock ? `In Stock (${item.availableQuantity})` : "Out of Stock"}
                  </span>
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button
                    className="btn btn-small"
                    onClick={() => handleMoveToCart(item)}
                    disabled={!item.inStock}
                    title={!item.inStock ? "Out of stock" : ""}
                  >
                    Move to Cart
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => requestRemove(item)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <WishlistAddForm
              customers={customers}
              products={products}
              onSubmit={handleAddSubmit}
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
          onConfirm={runRemove}
          onCancel={cancelRemove}
        />
      )}
    </div>
  );
}