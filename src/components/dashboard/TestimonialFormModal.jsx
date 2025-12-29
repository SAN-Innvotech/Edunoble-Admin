import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function TestimonialFormModal({ isOpen, onClose, testimonial, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    heading: "",
    quote: "",
    authorName: "",
    authorClass: "",
    authorDetails: "",
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!testimonial;

  // Populate form when modal opens or testimonial changes
  useEffect(() => {
    if (isOpen) {
      if (testimonial) {
        // Populate form with existing testimonial data
        setFormData({
          heading: testimonial.heading || "",
          quote: testimonial.quote || "",
          authorName: testimonial.authorName || "",
          authorClass: testimonial.authorClass || "",
          authorDetails: testimonial.authorDetails || "",
          order: testimonial.order || 0,
          isActive: testimonial.isActive !== undefined ? testimonial.isActive : true,
        });
      } else {
        // Reset form for new testimonial
        setFormData({
          heading: "",
          quote: "",
          authorName: "",
          authorClass: "",
          authorDetails: "",
          order: 0,
          isActive: true,
        });
      }
      setError(null);
      // Clear toast when modal opens
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen, testimonial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      // Validation
      if (!formData.heading.trim()) {
        throw new Error("Heading is required");
      }
      if (!formData.quote.trim()) {
        throw new Error("Quote is required");
      }
      if (!formData.authorName.trim()) {
        throw new Error("Author name is required");
      }

      const url = isEditMode
        ? getApiUrl(`testimonials/admin/${testimonial._id || testimonial.id}`)
        : getApiUrl("testimonials/admin");

      const method = isEditMode ? "PATCH" : "POST";

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          heading: formData.heading,
          quote: formData.quote,
          authorName: formData.authorName,
          authorClass: formData.authorClass,
          authorDetails: formData.authorDetails,
          order: parseInt(formData.order) || 0,
          ...(isEditMode && { isActive: formData.isActive }),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to save testimonial");
      }

      setToast({
        isVisible: true,
        message: result.message || (isEditMode ? "Testimonial updated successfully" : "Testimonial created successfully"),
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
              maxWidth: "800px",
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
              <h2 className="text-24 lh-1 fw-700 mb-30">
                {isEditMode ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>

              {error && (
                <div className="mb-20 p-15 bg-red-1 text-white rounded-8">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form row y-gap-30">
                {/* Heading */}
                <div className="col-12">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                    Heading <span className="text-red-1">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    placeholder="Enter testimonial heading"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                    }}
                  />
                </div>

                {/* Quote */}
                <div className="col-12">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                    Quote <span className="text-red-1">*</span>
                  </label>
                  <textarea
                    required
                    name="quote"
                    value={formData.quote}
                    onChange={handleChange}
                    placeholder="Enter testimonial quote"
                    rows="4"
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

                {/* Author Name */}
                <div className="col-lg-6">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                    Author Name <span className="text-red-1">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="authorName"
                    value={formData.authorName}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                    }}
                  />
                </div>

                {/* Author Class */}
                <div className="col-lg-6">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                    Author Class
                  </label>
                  <input
                    type="text"
                    name="authorClass"
                    value={formData.authorClass}
                    onChange={handleChange}
                    placeholder="e.g., Class 12 Science"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                    }}
                  />
                </div>

                {/* Author Details */}
                <div className="col-lg-6">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                    Author Details
                  </label>
                  <input
                    type="text"
                    name="authorDetails"
                    value={formData.authorDetails}
                    onChange={handleChange}
                    placeholder="e.g., Class 12 • PCM"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                    }}
                  />
                </div>

                {/* Order */}
                <div className="col-lg-6">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="Display order (0, 1, 2, ...)"
                    min="0"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                    }}
                  />
                </div>

                {/* Is Active - Only in Edit Mode */}
                {isEditMode && (
                  <div className="col-12">
                    <div className="row y-gap-10">
                      <div className="col-auto">
                        <label className="d-flex items-center cursor">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="mr-10"
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                            }}
                          />
                          <span className="text-16 fw-500 text-dark-1">Is Active</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="col-12 d-flex justify-end pt-20 x-gap-20">
                  <button
                    type="button"
                    onClick={onClose}
                    className="button -md -outline-purple-1 text-purple-1"
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
                    {loading ? "Saving..." : isEditMode ? "Update Testimonial" : "Create Testimonial"}
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

