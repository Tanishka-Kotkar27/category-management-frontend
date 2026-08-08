import React, { useEffect, useState } from "react";
import reviewService from "../services/reviewService";
import customerService from "../services/customerService";
import productService from "../services/productService";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";
import ConfirmModal from "./ConfirmModal";

export default function ReviewDashboard() {
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reviewService.getAll();
      setReviews(res.data);
    } catch (err) {
      setError("Failed to load reviews. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchReviews();
    fetchSupportingData();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    if (customers.length === 0 || products.length === 0) {
      setError("Need at least one customer and one product to add a review.");
      return;
    }
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await reviewService.add(data);
      flashSuccess("Review submitted successfully — pending approval");
      closeForm();
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (review) => {
    setError("");
    try {
      await reviewService.approve(review.reviewId);
      flashSuccess("Review approved");
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve review.");
    }
  };

  const handleReject = async (review) => {
    setError("");
    try {
      await reviewService.reject(review.reviewId);
      flashSuccess("Review rejected");
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject review.");
    }
  };

  const requestDelete = (review) => {
    setPendingDeleteId(review.reviewId);
    setConfirmConfig({
      title: "Delete Review",
      message: `Delete this review by ${review.customerName} for "${review.productName}"? This is permanent.`,
      isWarning: true,
      confirmLabel: "Delete",
    });
  };

  const runDelete = async () => {
    const id = pendingDeleteId;
    setConfirmConfig(null);
    setError("");
    try {
      await reviewService.deleteByAdmin(id);
      flashSuccess("Review deleted");
      setPendingDeleteId(null);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete review.");
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
    setConfirmConfig(null);
  };

  const filteredReviews = statusFilter === ""
    ? reviews
    : reviews.filter((r) => (statusFilter === "approved" ? r.status : !r.status));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Review & Rating Management</h1>
          <p className="subtitle">Moderate customer reviews and ratings</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Review
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <label htmlFor="statusFilter">Filter:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {loading ? (
        <p>Loading reviews...</p>
      ) : filteredReviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <div className="review-list">
          {filteredReviews.map((r) => (
            <div key={r.reviewId} className="review-card">
              <div className="review-card-header">
                <div>
                  <strong>{r.productName}</strong>
                  <span className="review-customer"> by {r.customerName}</span>
                </div>
                <span className={`badge ${r.status ? "badge-active" : "badge-inactive"}`}>
                  {r.status ? "Approved" : "Pending"}
                </span>
              </div>
              <StarRating value={r.rating} readOnly />
              <p className="review-text">{r.reviewText || <em>No written review</em>}</p>
              <div className="review-card-footer">
                <span className="text-muted">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
                <div className="actions-cell">
                  {!r.status && (
                    <button className="btn btn-small" onClick={() => handleApprove(r)}>
                      Approve
                    </button>
                  )}
                  {r.status && (
                    <button className="btn btn-small" onClick={() => handleReject(r)}>
                      Unapprove
                    </button>
                  )}
                  <button className="btn btn-small btn-danger" onClick={() => requestDelete(r)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-wide">
            <ReviewForm
              customers={customers}
              products={products}
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
          onConfirm={runDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}