import React, { useState, useEffect } from "react";

export default function CategoryForm({ initialData, onSubmit, onCancel, submitting }) {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.categoryName || "");
      setDescription(initialData.description || "");
    } else {
      setCategoryName("");
      setDescription("");
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = "Category name is required";
    } else if (categoryName.length > 100) {
      newErrors.categoryName = "Category name must be at most 100 characters";
    }
    if (description.length > 300) {
      newErrors.description = "Description must be at most 300 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ categoryName: categoryName.trim(), description: description.trim() });
  };

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Category" : "Create New Category"}</h2>

      <div className="form-group">
        <label htmlFor="categoryName">Category Name *</label>
        <input
          id="categoryName"
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          maxLength={100}
          placeholder="e.g. Electronics"
        />
        {errors.categoryName && <span className="error-text">{errors.categoryName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Brief description of this category"
        />
        <span className="char-count">{description.length}/300</span>
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Category" : "Create Category"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}