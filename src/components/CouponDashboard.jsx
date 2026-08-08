import React, { useEffect, useState } from "react";
import couponService from "../services/couponService";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import CouponForm from "./CouponForm";
import CouponApplyWidget from "./CouponApplyWidget";
import ConfirmModal from "./ConfirmModal";

export default function CouponDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingActionId, setPendingActionId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await couponService.getAll();
      setCoupons(res.data);
    } catch (err) {
      setError("Failed to load coupons. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportingData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoryService.getAll(),
        productService.getAll(),
      ]);
      setCategories(categoriesRes.data.filter((c) => c.status));
      setProducts(productsRes.data.filter((p) => p.status));
    } catch (err) {
      setError("Failed to load categories/products.");
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchSupportingData();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingCoupon) {
        await couponService.update(editingCoupon.couponId, data);
        flashSuccess("Coupon updated successfully");
      } else {
        await couponService.create(data);
        flashSuccess("Coupon created successfully");
      }
      closeForm();
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (coupon) => {
    setPendingActionId(coupon.couponId);
    setConfirmConfig({
      title: "Deactivate Coupon",
      message: `Deactivate coupon "${coupon.couponCode}"? It will no longer be usable at checkout.`,
      isWarning: false,
      confirmLabel: "Deactivate",
      action: "deactivate",
    });
  };

  const requestDelete = (coupon) => {
    setPendingActionId(coupon.couponId);
    setConfirmConfig({
      title: "Delete Coupon",
      message: `Permanently delete coupon "${coupon.couponCode}"? This cannot be undone.`,
      isWarning: true,
      confirmLabel: "Delete",
      action: "delete",
    });
  };

  const runConfirmedAction = async () => {
    const id = pendingActionId;
    const action = confirmConfig?.action;
    setConfirmConfig(null);
    setError("");
    try {
      if (action === "deactivate") {
        await couponService.deactivate(id);
        flashSuccess("Coupon deactivated successfully");
      } else if (action === "delete") {
        await couponService.remove(id);
        flashSuccess("Coupon deleted successfully");
      }
      setPendingActionId(null);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
      setPendingActionId(null);
    }
  };

  const cancelConfirm = () => {
    setPendingActionId(null);
    setConfirmConfig(null);
  };

  const handleActivate = async (coupon) => {
    setError("");
    try {
      await couponService.activate(coupon.couponId);
      flashSuccess("Coupon activated successfully");
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate coupon.");
    }
  };

  const stateBadgeClass = (state) => {
    switch (state) {
      case "ACTIVE": return "badge-active";
      case "EXPIRED":
      case "EXHAUSTED":
      case "INACTIVE": return "badge-inactive";
      case "UPCOMING": return "coupon-state-upcoming";
      default: return "badge-inactive";
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Coupon & Discount Management</h1>
          <p className="subtitle">Create and manage discount codes and promotions</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Create Coupon
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <CouponApplyWidget />

      {loading ? (
        <p>Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <p>No coupons yet. Click "Create Coupon" to add your first one.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Valid Period</th>
              <th>Usage</th>
              <th>Restrictions</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.couponId} className={!c.status ? "row-inactive" : ""}>
                <td className="mono-text">{c.couponCode}</td>
                <td>
                  {c.discountType === "PERCENTAGE"
                    ? `${Number(c.discountValue)}%`
                    : `$${Number(c.discountValue).toFixed(2)}`}
                </td>
                <td>
                  {new Date(c.validFrom).toLocaleDateString()} –{" "}
                  {new Date(c.validTo).toLocaleDateString()}
                </td>
                <td>
                  {c.timesUsed}
                  {c.usageLimit ? ` / ${c.usageLimit}` : " / ∞"}
                </td>
                <td>
                  {c.applicableCategoryName || c.applicableProductName || c.minOrderAmount ? (
                    <span className="text-muted">
                      {[
                        c.applicableCategoryName && `Category: ${c.applicableCategoryName}`,
                        c.applicableProductName && `Product: ${c.applicableProductName}`,
                        c.minOrderAmount && `Min: $${Number(c.minOrderAmount).toFixed(2)}`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <span className={`badge ${stateBadgeClass(c.computedState)}`}>
                    {c.computedState}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-small" onClick={() => openEditForm(c)}>
                    Edit
                  </button>
                  {c.status ? (
                    <button className="btn btn-small btn-danger" onClick={() => requestDeactivate(c)}>
                      Deactivate
                    </button>
                  ) : (
                    <button className="btn btn-small" onClick={() => handleActivate(c)}>
                      Activate
                    </button>
                  )}
                  <button className="btn btn-small btn-danger" onClick={() => requestDelete(c)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-wide">
            <CouponForm
              initialData={editingCoupon}
              categories={categories}
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
          onConfirm={runConfirmedAction}
          onCancel={cancelConfirm}
        />
      )}
    </div>
  );
}