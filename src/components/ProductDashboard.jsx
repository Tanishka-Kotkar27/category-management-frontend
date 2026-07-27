import React, { useEffect, useState } from "react";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import ProductForm from "./ProductForm";
import ConfirmModal from "./ConfirmModal";

export default function ProductDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingDeactivateId, setPendingDeactivateId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.filter((c) => c.status)); // only active categories for assignment
    } catch (err) {
      setError("Failed to load products. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const openCreateForm = () => {
    if (categories.length === 0) {
      setError("Please create at least one active category before adding a product.");
      return;
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingProduct) {
        await productService.update(editingProduct.productId, data);
        flashSuccess("Product updated successfully");
      } else {
        await productService.create(data);
        flashSuccess("Product created successfully");
      }
      closeForm();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (product) => {
    setPendingDeactivateId(product.productId);
    setConfirmConfig({
      title: "Deactivate Product",
      message: `Deactivating "${product.productName}" will hide it from the customer interface immediately. Continue?`,
      isWarning: true,
      confirmLabel: "Deactivate",
    });
  };

  const runDeactivate = async () => {
    const id = pendingDeactivateId;
    setConfirmConfig(null);
    setError("");
    try {
      await productService.deactivate(id);
      flashSuccess("Product deactivated successfully");
      setPendingDeactivateId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate product.");
      setPendingDeactivateId(null);
    }
  };

  const cancelDeactivate = () => {
    setPendingDeactivateId(null);
    setConfirmConfig(null);
  };

  const handleActivate = async (product) => {
    setError("");
    try {
      await productService.activate(product.productId);
      flashSuccess("Product reactivated successfully");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate product.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Product Management</h1>
          <p className="subtitle">Manage your inventory and product catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Product
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products yet. Click "Add Product" to create your first one.</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId} className={!p.status ? "row-inactive" : ""}>
                <td>{p.productName}</td>
                <td>{p.sku}</td>
                <td>{p.categoryName || "—"}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.inventoryCount}</td>
                <td>
                  <span className={`badge ${p.status ? "badge-active" : "badge-inactive"}`}>
                    {p.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-small" onClick={() => openEditForm(p)}>
                    Edit
                  </button>
                  {p.status ? (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => requestDeactivate(p)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button className="btn btn-small" onClick={() => handleActivate(p)}>
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
          <div className="modal-box modal-box-wide">
            <ProductForm
              initialData={editingProduct}
              categories={categories}
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