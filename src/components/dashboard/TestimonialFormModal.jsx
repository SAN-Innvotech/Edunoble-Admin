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
    photoUrl: "",
    rating: null,
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const isEditMode = !!testimonial;

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("-dark-mode"));
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
          photoUrl: testimonial.photoUrl || "",
          rating:
            typeof testimonial.rating === "number" && testimonial.rating >= 1 && testimonial.rating <= 5
              ? testimonial.rating
              : null,
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
          photoUrl: "",
          rating: null,
          order: 0,
          isActive: true,
        });
      }
      setError(null);
      setHoverRating(0);
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setToast({
        isVisible: true,
        message: "Please select a valid image file",
        type: "error",
      });
      e.target.value = "";
      return;
    }

    // 5 MB max client-side check
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setToast({
        isVisible: true,
        message: "Image must be 5 MB or smaller",
        type: "error",
      });
      e.target.value = "";
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const headers = {};
      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl("upload/image"), {
        method: "POST",
        headers,
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to upload image");
      }

      setFormData((prev) => ({
        ...prev,
        photoUrl: result.data?.imageUrl || "",
      }));

      setToast({
        isVisible: true,
        message: "Photo uploaded successfully",
        type: "success",
      });
    } catch (err) {
      const errorMessage = err.message || "An error occurred while uploading the photo";
      setError(errorMessage);
      setToast({
        isVisible: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setUploadLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photoUrl: "" }));
  };

  const handleRatingSelect = (value) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const handleClearRating = () => {
    setFormData((prev) => ({ ...prev, rating: null }));
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
          photoUrl: formData.photoUrl ? formData.photoUrl.trim() : "",
          rating:
            typeof formData.rating === "number" && formData.rating >= 1 && formData.rating <= 5
              ? formData.rating
              : null,
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

  const displayRating = hoverRating || formData.rating || 0;

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
            className="rounded-16 shadow-4 d-flex flex-column testimonial-form-modal-container"
            style={{
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              backgroundColor: isDarkMode ? "#140342" : "#ffffff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="close cursor testimonial-form-modal-close"
              onClick={onClose}
              style={{
                position: "absolute",
                top: "15px",
                right: "25px",
                color: isDarkMode ? "#ffffff" : "#333",
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
              <h2 className={`text-24 lh-1 fw-700 mb-30 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                {isEditMode ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>

              {error && (
                <div className="mb-20 p-15 bg-red-1 text-white rounded-8">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form row y-gap-30">
                <style>
                  {`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                    .testimonial-form-modal-container input::placeholder,
                    .testimonial-form-modal-container textarea::placeholder {
                      color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
                    }
                    .testimonial-form-modal-container input:focus,
                    .testimonial-form-modal-container textarea:focus {
                      outline: none;
                      border-color: #6366f1 !important;
                      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }
                  `}
                </style>
                {/* Heading */}
                <div className="col-12">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                </div>

                {/* Quote */}
                <div className="col-12">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      resize: "vertical",
                      fontFamily: "inherit",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                </div>

                {/* Author Name */}
                <div className="col-lg-6">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                </div>

                {/* Author Class */}
                <div className="col-lg-6">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Author Class
                  </label>
                  <input
                    type="text"
                    name="authorClass"
                    value={formData.authorClass}
                    onChange={handleChange}
                    placeholder="e.g., Class 12 Science"
                    style={{
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                </div>

                {/* Author Details */}
                <div className="col-lg-6">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Author Details
                  </label>
                  <input
                    type="text"
                    name="authorDetails"
                    value={formData.authorDetails}
                    onChange={handleChange}
                    placeholder="e.g., Class 12 • PCM"
                    style={{
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                </div>

                {/* Order */}
                <div className="col-lg-6">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                </div>

                {/* Photo Upload */}
                <div className="col-12">
                  <div className="d-flex items-center justify-between mb-10">
                    <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                      Photo (Optional)
                    </label>
                    <label
                      htmlFor="testimonialPhotoUpload"
                      style={{
                        cursor: uploadLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        backgroundColor: uploadLoading
                          ? (isDarkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.1)")
                          : (isDarkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"),
                        color: "#6366f1",
                        transition: "all 0.2s",
                        opacity: uploadLoading ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!uploadLoading) {
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? "rgba(99, 102, 241, 0.3)"
                            : "rgba(99, 102, 241, 0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!uploadLoading) {
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? "rgba(99, 102, 241, 0.2)"
                            : "rgba(99, 102, 241, 0.1)";
                        }
                      }}
                      title="Upload photo (max 5 MB)"
                    >
                      {uploadLoading ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ animation: "spin 1s linear infinite" }}
                        >
                          <line x1="12" y1="2" x2="12" y2="6"></line>
                          <line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line>
                          <line x1="18" y1="12" x2="22" y2="12"></line>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      )}
                      <input
                        id="testimonialPhotoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadLoading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <div className="d-flex items-center" style={{ gap: "12px" }}>
                    {formData.photoUrl ? (
                      <div style={{ position: "relative", width: "60px", height: "60px", flexShrink: 0 }}>
                        <img
                          src={formData.photoUrl}
                          alt="Author"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #DDDDDD",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          title="Remove photo"
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "#ef4444",
                            color: "#ffffff",
                            border: "2px solid " + (isDarkMode ? "#140342" : "#ffffff"),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "14px",
                            lineHeight: "1",
                            padding: 0,
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          backgroundColor: isDarkMode ? "#2B1C55" : "#f3f4f6",
                          border: isDarkMode ? "1px dashed rgba(255, 255, 255, 0.2)" : "1px dashed #DDDDDD",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isDarkMode ? "rgba(255, 255, 255, 0.4)" : "#9ca3af",
                        }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="4"></circle>
                          <path d="M4 21c0-4 4-7 8-7s8 3 8 7"></path>
                        </svg>
                      </div>
                    )}
                    <input
                      type="url"
                      name="photoUrl"
                      value={formData.photoUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/photo.jpg or use the upload icon above"
                      style={{
                        backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                        borderRadius: "8px",
                        padding: "15px 22px",
                        fontSize: "15px",
                        flex: 1,
                        color: isDarkMode ? "#ffffff" : "#000000",
                      }}
                    />
                  </div>
                </div>

                {/* Rating */}
                <div className="col-12">
                  <div className="d-flex items-center justify-between mb-10">
                    <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                      Rating (Optional)
                    </label>
                    {formData.rating !== null && (
                      <button
                        type="button"
                        onClick={handleClearRating}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#6366f1",
                          fontSize: "13px",
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div
                    className="d-flex items-center"
                    style={{ gap: "6px" }}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = star <= displayRating;
                      return (
                        <span
                          key={star}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleRatingSelect(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleRatingSelect(star);
                            }
                          }}
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                          style={{
                            cursor: "pointer",
                            fontSize: "32px",
                            lineHeight: "1",
                            color: filled ? "#FFC107" : (isDarkMode ? "rgba(255, 255, 255, 0.25)" : "#d1d5db"),
                            transition: "color 0.15s, transform 0.15s",
                            userSelect: "none",
                            transform: hoverRating === star ? "scale(1.15)" : "scale(1)",
                          }}
                        >
                          ★
                        </span>
                      );
                    })}
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "14px",
                        color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "#6b7280",
                      }}
                    >
                      {formData.rating !== null ? `${formData.rating} / 5` : "Not rated"}
                    </span>
                  </div>
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
                          <span className={`text-16 fw-500 ${isDarkMode ? "text-white" : "text-dark-1"}`}>Is Active</span>
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
