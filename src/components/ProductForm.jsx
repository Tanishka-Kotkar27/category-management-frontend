import React, { useState, useEffect } from "react";

export default function ProductForm({ initialData, categories, onSubmit, onCancel, submitting }) {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [inventoryCount, setInventoryCount] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.productName || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price ?? "");
      setSku(initialData.sku || "");
      setCategoryId(initialData.categoryId ?? "");
      setInventoryCount(initialData.inventoryCount ?? "");
    } else {
      setProductName("");
      setDescription("");
      setPrice("");
      setSku("");
      setCategoryId("");
      setInventoryCount("");
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = "Product name is required";
    else if (productName.length > 150) newErrors.productName = "Must be at most 150 characters";

    if (description.length > 500) newErrors.description = "Must be at most 500 characters";

    if (price === "" || isNaN(price) || Number(price) <= 0)
      newErrors.price = "Price must be a number greater than 0";

    if (!sku.trim()) newErrors.sku = "SKU is required";
    else if (sku.length > 50) newErrors.sku = "Must be at most 50 characters";

    if (!categoryId) newErrors.categoryId = "Please select a category";

    if (inventoryCount === "" || isNaN(inventoryCount) || Number(inventoryCount) < 0)
      newErrors.inventoryCount = "Inventory count cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      productName: productName.trim(),
      description: description.trim(),
      price: Number(price),
      sku: sku.trim(),
      categoryId: Number(categoryId),
      inventoryCount: Number(inventoryCount),
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Product" : "Add New Product"}</h2>

      <div className="form-group">
        <label htmlFor="productName">Product Name *</label>
        <input
          id="productName"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          maxLength={150}
          placeholder="e.g. Wireless Mouse"
        />
        {errors.productName && <span className="error-text">{errors.productName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Brief description of this product"
        />
        <span className="char-count">{description.length}/500</span>
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Price *</label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="sku">SKU *</label>
          <input
            id="sku"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            maxLength={50}
            placeholder="e.g. WM-001"
          />
          {errors.sku && <span className="error-text">{errors.sku}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="inventoryCount">Inventory Count *</label>
          <input
            id="inventoryCount"
            type="number"
            min="0"
            value={inventoryCount}
            onChange={(e) => setInventoryCount(e.target.value)}
            placeholder="0"
          />
          {errors.inventoryCount && <span className="error-text">{errors.inventoryCount}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Product" : "Add Product"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}