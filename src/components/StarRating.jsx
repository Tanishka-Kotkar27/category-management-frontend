import React from "react";

export default function StarRating({ value, onChange, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" style={{ cursor: readOnly ? "default" : "pointer" }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange && onChange(star)}
          className={`star ${star <= value ? "star-filled" : "star-empty"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}