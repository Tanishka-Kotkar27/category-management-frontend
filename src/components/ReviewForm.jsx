import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";

export default function ReviewForm({ customers, products, initialData, onSubmit, onCancel, submitting }) {
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customerId);
      setProductId(initialData.productId);
      setRating(initialData.rating);
      setReviewText(initialData.reviewText || "");
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!initialData && !customerId) newErrors.customerId = "Please select a customer";
    if (!initialData && !productId) newErrors.productId = "Please select a product";
    if (!rating || rating < 1 || rating > 5) newErrors.rating = "Please select a rating";
    if (reviewText.length > 1000) newErrors.reviewText = "Must be at most 1000 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData) {
      onSubmit({ rating, reviewText: reviewText.trim() });
    } else {
      onSubmit({
        customerId: Number(customerId),
        productId: Number(productId),
        rating,
        reviewText: reviewText.trim(),
      });
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Review" : "Write a Review"}</h2>

      {!initialData && (
        <div className="form-row">
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

          <div className="form-group">
            <label htmlFor="productId">Product *</label>
            <select id="productId" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName}
                </option>
              ))}
            </select>
            {errors.productId && <span className="error-text">{errors.productId}</span>}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Rating *</label>
        <StarRating value={rating} onChange={setRating} />
        {errors.rating && <span className="error-text">{errors.rating}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="reviewText">Review</label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Share your experience with this product..."
        />
        <span className="char-count">{reviewText.length}/1000</span>
        {errors.reviewText && <span className="error-text">{errors.reviewText}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : initialData ? "Update Review" : "Submit Review"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}