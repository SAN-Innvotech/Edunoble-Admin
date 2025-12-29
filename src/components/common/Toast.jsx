import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Toast({ message, type = "success", isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-1" : "bg-red-1";
  const icon = type === "success" ? "icon-check" : "icon-close";

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 10001,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        className={`${bgColor} text-white px-30 py-20 rounded-8 shadow-4 d-flex items-center x-gap-15`}
        style={{
          minWidth: "300px",
          maxWidth: "500px",
        }}
      >
        <i className={`${icon} text-20`}></i>
        <span className="text-14 fw-500 flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white cursor"
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            lineHeight: "1",
            padding: "0",
            opacity: "0.8",
          }}
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}

