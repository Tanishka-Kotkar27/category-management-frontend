import React from "react";

export default function ConfirmModal({ title, message, isWarning, onConfirm, onCancel, confirmLabel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{title}</h3>
        <p className={isWarning ? "warning-text" : ""}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel || "Confirm"}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}