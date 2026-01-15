import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function FAQFormModal({ isOpen, onClose, faq, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isEditMode = !!faq;

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

  // Populate form when modal opens or faq changes
  useEffect(() => {
    if (isOpen) {
      if (faq) {
        // Populate form with existing FAQ data
        setFormData({
          question: faq.question || "",
          answer: faq.answer || "",
          order: faq.order || 0,
          isActive: faq.isActive !== undefined ? faq.isActive : true,
        });
      } else {
        // Reset form for new FAQ
        setFormData({
          question: "",
          answer: "",
          order: 0,
          isActive: true,
        });
      }
      setError(null);
      // Clear toast when modal opens
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen, faq]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      // Validation
      if (!formData.question.trim()) {
        throw new Error("Question is required");
      }
      if (!formData.answer.trim()) {
        throw new Error("Answer is required");
      }

      const url = isEditMode
        ? getApiUrl(`contact/admin/faq/${faq._id || faq.id}`)
        : getApiUrl("contact/admin/faq");

      const method = isEditMode ? "PATCH" : "POST";

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      // Build request body
      const requestBody = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
      };

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to save FAQ");
      }

      setToast({
        isVisible: true,
        message: result.message || (isEditMode ? "FAQ updated successfully" : "FAQ created successfully"),
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
            className="rounded-16 shadow-4 d-flex flex-column faq-form-modal-container"
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
              className="close cursor faq-form-modal-close"
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
                {isEditMode ? "Edit FAQ" : "Add New FAQ"}
              </h2>

              {error && (
                <div className="mb-20 p-15 bg-red-1 text-white rounded-8">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form row y-gap-30">
                <style>
                  {`
                    .faq-form-modal-container input::placeholder,
                    .faq-form-modal-container textarea::placeholder {
                      color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
                    }
                    .faq-form-modal-container input:focus,
                    .faq-form-modal-container textarea:focus {
                      outline: none;
                      border-color: #6366f1 !important;
                      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }
                  `}
                </style>
                
                {/* Question */}
                <div className="col-12">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Question <span className="text-red-1">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    placeholder="Enter the question"
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

                {/* Answer */}
                <div className="col-12">
                  <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    Answer <span className="text-red-1">*</span>
                  </label>
                  <textarea
                    required
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    placeholder="Enter the answer"
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
                    {loading ? "Saving..." : isEditMode ? "Update FAQ" : "Create FAQ"}
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
