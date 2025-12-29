import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function ResolveQueryModal({ isOpen, onClose, query, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setError(null);
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      if (!query || !query._id) {
        throw new Error("Invalid query data");
      }

      const url = getApiUrl(`contact/admin/${query._id}/resolve`);

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to resolve query");
      }

      setToast({
        isVisible: true,
        message: result.message || "Query resolved successfully",
        type: "success",
      });

      // Call onSuccess to refresh the list
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after a short delay to show toast
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      setToast({
        isVisible: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div
          style={{
            display: isOpen ? "flex" : "none",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 10000,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <div
            className="rounded-16 bg-white shadow-4 d-flex flex-column"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="close cursor"
              onClick={onClose}
              style={{
                position: "absolute",
                top: "15px",
                right: "25px",
                color: "#333",
                fontSize: "35px",
                fontWeight: "bold",
                zIndex: 10001,
                cursor: "pointer",
                lineHeight: "1",
              }}
            >
              <span>&times;</span>
            </div>

            <div className="px-30 py-30 flex-grow-1 overflow-y-auto">
              <h2 className="text-24 lh-1 fw-700 mb-30">Resolve Query</h2>

              {query && (
                <div className="mb-20 p-15 bg-light-4 rounded-8">
                  <div className="text-14 text-dark-1 mb-5">
                    <strong>From:</strong> {query.name || "Anonymous"}
                  </div>
                  {query.email && (
                    <div className="text-14 text-dark-1 mb-5">
                      <strong>Email:</strong> {query.email}
                    </div>
                  )}
                  {query.subject && (
                    <div className="text-14 text-dark-1">
                      <strong>Subject:</strong> {query.subject}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-20 p-15 bg-red-1 text-white rounded-8">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form row y-gap-30">
                {/* Notes */}
                <div className="col-12">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                    Notes <span className="text-red-1">*</span>
                  </label>
                  <textarea
                    required
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter resolution notes..."
                    rows="6"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="col-12 d-flex justify-end pt-20 x-gap-20">
                  <button
                    type="button"
                    onClick={onClose}
                    className="button -md -dark-1"
                    disabled={loading}
                    style={{
                      border: "1px solid #6366f1",
                      background: "transparent",
                      color: "#6366f1",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button -md -purple-1 text-white"
                    disabled={loading}
                    style={{
                      border: "1px solid #6366f1",
                      background: "#6366f1",
                      color: "white",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontSize: "15px",
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
      {createPortal(
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />,
        document.body
      )}
    </>
  );
}

