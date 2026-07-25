import React, { useEffect, useState } from "react";
import categoryService from "../services/categoryService";
import CategoryForm from "./CategoryForm";
import ConfirmModal from "./ConfirmModal";

export default function CategoryDashboard() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingDeactivateId, setPendingDeactivateId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await categoryService.getAll();
      setCategories(res.data);
    } catch (err) {
      setError("Failed to load categories. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.categoryId, data);
        flashSuccess("Category updated successfully");
      } else {
        await categoryService.create(data);
        flashSuccess("Category created successfully");
      }
      closeForm();
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (category) => {
    setPendingDeactivateId(category.categoryId);
    setConfirmConfig({
      title: "Deactivate Category",
      message: `Are you sure you want to deactivate "${category.categoryName}"?`,
      isWarning: false,
      confirmLabel: "Deactivate",
      force: false,
    });
  };

  const runDeactivate = async () => {
    const id = pendingDeactivateId;
    const force = confirmConfig?.force || false;
    setConfirmConfig(null);
    setError("");
    try {
      await categoryService.deactivate(id, force);
      flashSuccess("Category deactivated successfully");
      setPendingDeactivateId(null);
      fetchCategories();
    } catch (err) {
      if (err.response?.status === 409) {
        setConfirmConfig({
          title: "Products Still Assigned",
          message: err.response.data.message,
          isWarning: true,
          confirmLabel: "Deactivate Anyway",
          force: true,
        });
      } else {
        setError(err.response?.data?.message || "Failed to deactivate category.");
        setPendingDeactivateId(null);
      }
    }
  };

  const cancelDeactivate = () => {
    setPendingDeactivateId(null);
    setConfirmConfig(null);
  };

  const handleActivate = async (category) => {
    setError("");
    try {
      await categoryService.activate(category.categoryId);
      flashSuccess("Category reactivated successfully");
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate category.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Category Management</h1>
          <p className="subtitle">Organize your products into categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Category
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories yet. Click "Add Category" to create your first one.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.categoryId} className={!cat.status ? "row-inactive" : ""}>
                <td>{cat.categoryName}</td>
                <td>{cat.description || "—"}</td>
                <td>{cat.productCount}</td>
                <td>
                  <span className={`badge ${cat.status ? "badge-active" : "badge-inactive"}`}>
                    {cat.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-small" onClick={() => openEditForm(cat)}>
                    Edit
                  </button>
                  {cat.status ? (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => requestDeactivate(cat)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button className="btn btn-small" onClick={() => handleActivate(cat)}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <CategoryForm
              initialData={editingCategory}
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
          onConfirm={runDeactivate}
          onCancel={cancelDeactivate}
        />
      )}
    </div>
  );
}