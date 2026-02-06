import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function ContentFormModal({ isOpen, onClose, content, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    pictureUrl: "",
    type: "about",
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isEditMode = !!content;

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

  // Populate form when modal opens or content changes
  useEffect(() => {
    if (isOpen) {
      if (content) {
        // Populate form with existing content data
        setFormData({
          title: content.title || "",
          content: content.content || "",
          pictureUrl: content.pictureUrl || "",
          type: content.type || "about",
          order: content.order || 0,
          isActive: content.isActive !== undefined ? content.isActive : true,
        });
      } else {
        // Reset form for new content
        setFormData({
          title: "",
          content: "",
          pictureUrl: "",
          type: "about",
          order: 0,
          isActive: true,
        });
      }
      setError(null);
      // Clear toast when modal opens
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen, content]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" 
        ? checked 
        : name === "order" 
          ? (value === "" ? 0 : parseInt(value) || 0)
          : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setToast({
        isVisible: true,
        message: "Please select a valid image file",
        type: "error",
      });
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const headers = {};
      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl("upload/image"), {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to upload image");
      }

      // Update pictureUrl with the returned imageUrl
      setFormData((prev) => ({
        ...prev,
        pictureUrl: result.data?.imageUrl || "",
      }));

      setToast({
        isVisible: true,
        message: "Image uploaded successfully",
        type: "success",
      });
    } catch (err) {
      const errorMessage = err.message || "An error occurred while uploading the image";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.content.trim()) {
        throw new Error("Content is required");
      }

      const url = isEditMode
        ? getApiUrl(`content-pages/admin/${content._id || content.id}`)
        : getApiUrl("content-pages/admin");

      const method = isEditMode ? "PATCH" : "POST";

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      // Build request body
      const requestBody = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
        pictureUrl: formData.pictureUrl ? formData.pictureUrl.trim() : "",
      };

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to save content");
      }

      setToast({
        isVisible: true,
        message: result.message || (isEditMode ? "Content updated successfully" : "Content created successfully"),
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
            className="rounded-16 shadow-4 d-flex flex-column content-form-modal-container"
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
              className="close cursor content-form-modal-close"
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
                {isEditMode ? "Edit Content" : "Add New Content"}
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
                      from {
                        transform: rotate(0deg);
                      }
                      to {
                        transform: rotate(360deg);
                      }
                    }
                    .content-form-modal-container input::placeholder,
                    .content-form-modal-container textarea::placeholder {
                      color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
                    }
                    .content-form-modal-container input:focus,
                    .content-form-modal-container textarea:focus,
                    .content-form-modal-container select:focus {
                      outline: none;
                      border-color: #6366f1 !important;
                      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }
                    .content-form-modal-container select {
                      cursor: pointer;
                    }
                    .content-form-modal-container select option {
                      background-color: ${isDarkMode ? "#2B1C55" : "#ffffff"};
                      color: ${isDarkMode ? "#ffffff" : "#000000"};
                    }
                  `}
                </style>
                
                {/* Title */}
                <div className="col-12">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Title <span className="text-red-1">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter content title"
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

                {/* Content */}
                <div className="col-12">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Content <span className="text-red-1">*</span>
                  </label>
                  <textarea
                    required
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Enter content text"
                    rows="6"
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

                {/* Picture URL */}
                <div className="col-12">
                  <div className="d-flex items-center justify-between mb-10">
                    <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                      Picture URL (Optional)
                    </label>
                    <label
                      htmlFor="pictureUpload"
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
                          e.target.style.backgroundColor = isDarkMode 
                            ? "rgba(99, 102, 241, 0.3)" 
                            : "rgba(99, 102, 241, 0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!uploadLoading) {
                          e.target.style.backgroundColor = isDarkMode 
                            ? "rgba(99, 102, 241, 0.2)" 
                            : "rgba(99, 102, 241, 0.1)";
                        }
                      }}
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
                          style={{
                            animation: "spin 1s linear infinite",
                          }}
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
                        id="pictureUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadLoading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    name="pictureUrl"
                    value={formData.pictureUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
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

                {/* Type */}
                <div className="col-lg-6">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Type <span className="text-red-1">*</span>
                  </label>
                  <select
                    required
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    style={{
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      padding: "15px 22px",
                      fontSize: "15px",
                      width: "100%",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  >
                    <option value="about">About Us</option>
                    <option value="vision">Vision</option>
                  </select>
                </div>

                {/* Order */}
                <div className="col-lg-6">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order !== undefined && formData.order !== null ? formData.order : ""}
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
                    {loading ? "Saving..." : isEditMode ? "Update Content" : "Create Content"}
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
