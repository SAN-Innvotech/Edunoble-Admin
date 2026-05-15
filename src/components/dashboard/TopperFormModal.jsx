import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function TopperFormModal({ isOpen, onClose, topper, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    studentName: "",
    photo: "",
    examName: "",
    score: "",
    year: "",
    classLevel: "",
    board: "",
    achievement: "",
    quote: "",
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isEditMode = !!topper;

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("-dark-mode"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Populate form when modal opens or topper changes
  useEffect(() => {
    if (isOpen) {
      if (topper) {
        setFormData({
          studentName: topper.studentName || "",
          photo: topper.photo || "",
          examName: topper.examName || "",
          score: topper.score || "",
          year: topper.year || "",
          classLevel: topper.classLevel || "",
          board: topper.board || "",
          achievement: topper.achievement || "",
          quote: topper.quote || "",
          order: topper.order || 0,
          isActive: topper.isActive !== undefined ? topper.isActive : true,
        });
      } else {
        setFormData({
          studentName: "",
          photo: "",
          examName: "",
          score: "",
          year: "",
          classLevel: "",
          board: "",
          achievement: "",
          quote: "",
          order: 0,
          isActive: true,
        });
      }
      setError(null);
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen, topper]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "order"
          ? value === ""
            ? 0
            : parseInt(value) || 0
          : value,
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        isVisible: true,
        message: "Please select a valid image file",
        type: "error",
      });
      e.target.value = "";
      return;
    }

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
        photo: result.data?.imageUrl || "",
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
      e.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      if (!formData.studentName.trim()) {
        throw new Error("Student name is required");
      }

      const url = isEditMode
        ? getApiUrl(`toppers/admin/${topper._id || topper.id}`)
        : getApiUrl("toppers/admin");

      const method = isEditMode ? "PATCH" : "POST";

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const requestBody = {
        studentName: formData.studentName,
        photo: formData.photo ? formData.photo.trim() : "",
        examName: formData.examName,
        score: formData.score,
        year: formData.year,
        classLevel: formData.classLevel,
        board: formData.board,
        achievement: formData.achievement,
        quote: formData.quote,
        order: parseInt(formData.order) || 0,
        ...(isEditMode && { isActive: formData.isActive }),
      };

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to save topper");
      }

      setToast({
        isVisible: true,
        message:
          result.message ||
          (isEditMode ? "Topper updated successfully" : "Topper created successfully"),
        type: "success",
      });

      if (onSuccess) {
        onSuccess();
      }

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

  const inputStyle = {
    backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
    borderRadius: "8px",
    padding: "15px 22px",
    fontSize: "15px",
    width: "100%",
    color: isDarkMode ? "#ffffff" : "#000000",
  };

  const labelClass = `text-16 lh-1 fw-500 mb-10 d-block ${
    isDarkMode ? "text-white" : "text-dark-1"
  }`;

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
            className="rounded-16 shadow-4 d-flex flex-column topper-form-modal-container"
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
              className="close cursor topper-form-modal-close"
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
              <h2
                className={`text-24 lh-1 fw-700 mb-30 ${
                  isDarkMode ? "text-white" : "text-dark-1"
                }`}
              >
                {isEditMode ? "Edit Topper" : "Add New Topper"}
              </h2>

              {error && (
                <div className="mb-20 p-15 bg-red-1 text-white rounded-8">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="contact-form row y-gap-30">
                <style>
                  {`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                    .topper-form-modal-container input::placeholder,
                    .topper-form-modal-container textarea::placeholder {
                      color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
                    }
                    .topper-form-modal-container input:focus,
                    .topper-form-modal-container textarea:focus {
                      outline: none;
                      border-color: #6366f1 !important;
                      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }
                  `}
                </style>

                {/* Student Name */}
                <div className="col-12">
                  <label className={labelClass}>
                    Student Name <span className="text-red-1">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    style={inputStyle}
                  />
                </div>

                {/* Photo Upload */}
                <div className="col-12">
                  <div className="d-flex items-center justify-between mb-10">
                    <label
                      className={`text-16 lh-1 fw-500 d-block ${
                        isDarkMode ? "text-white" : "text-dark-1"
                      }`}
                    >
                      Photo (Optional)
                    </label>
                    <label
                      htmlFor="topperPhotoUpload"
                      style={{
                        cursor: uploadLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        backgroundColor: isDarkMode
                          ? "rgba(99, 102, 241, 0.2)"
                          : "rgba(99, 102, 241, 0.1)",
                        color: "#6366f1",
                        transition: "all 0.2s",
                        opacity: uploadLoading ? 0.6 : 1,
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
                        id="topperPhotoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadLoading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <div className="d-flex items-center" style={{ gap: "12px" }}>
                    {formData.photo ? (
                      <div
                        style={{
                          position: "relative",
                          width: "60px",
                          height: "60px",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={formData.photo}
                          alt="Student"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: isDarkMode
                              ? "1px solid rgba(255, 255, 255, 0.15)"
                              : "1px solid #DDDDDD",
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
                          border: isDarkMode
                            ? "1px dashed rgba(255, 255, 255, 0.2)"
                            : "1px dashed #DDDDDD",
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
                      name="photo"
                      value={formData.photo}
                      onChange={handleChange}
                      placeholder="https://example.com/photo.jpg or use the upload icon above"
                      style={{ ...inputStyle, flex: 1, width: "auto" }}
                    />
                  </div>
                </div>

                {/* Exam Name */}
                <div className="col-lg-6">
                  <label className={labelClass}>Exam Name</label>
                  <input
                    type="text"
                    name="examName"
                    value={formData.examName}
                    onChange={handleChange}
                    placeholder="e.g., JEE Advanced"
                    style={inputStyle}
                  />
                </div>

                {/* Score */}
                <div className="col-lg-6">
                  <label className={labelClass}>Score</label>
                  <input
                    type="text"
                    name="score"
                    value={formData.score}
                    onChange={handleChange}
                    placeholder="e.g., 98.7% / AIR 142"
                    style={inputStyle}
                  />
                </div>

                {/* Year */}
                <div className="col-lg-6">
                  <label className={labelClass}>Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 2025"
                    style={inputStyle}
                  />
                </div>

                {/* Class Level */}
                <div className="col-lg-6">
                  <label className={labelClass}>Class Level</label>
                  <input
                    type="text"
                    name="classLevel"
                    value={formData.classLevel}
                    onChange={handleChange}
                    placeholder="e.g., Class 12"
                    style={inputStyle}
                  />
                </div>

                {/* Board */}
                <div className="col-lg-6">
                  <label className={labelClass}>Board</label>
                  <input
                    type="text"
                    name="board"
                    value={formData.board}
                    onChange={handleChange}
                    placeholder="e.g., CBSE"
                    style={inputStyle}
                  />
                </div>

                {/* Order */}
                <div className="col-lg-6">
                  <label className={labelClass}>Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="Display order (0, 1, 2, ...)"
                    min="0"
                    style={inputStyle}
                  />
                </div>

                {/* Achievement */}
                <div className="col-12">
                  <label className={labelClass}>Achievement</label>
                  <input
                    type="text"
                    name="achievement"
                    value={formData.achievement}
                    onChange={handleChange}
                    placeholder="e.g., District topper in Physics"
                    style={inputStyle}
                  />
                </div>

                {/* Quote */}
                <div className="col-12">
                  <label className={labelClass}>Quote</label>
                  <textarea
                    name="quote"
                    value={formData.quote}
                    onChange={handleChange}
                    placeholder="A quote from the student"
                    rows="4"
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
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
                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                          />
                          <span
                            className={`text-16 fw-500 ${
                              isDarkMode ? "text-white" : "text-dark-1"
                            }`}
                          >
                            Is Active
                          </span>
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
                    {loading ? "Saving..." : isEditMode ? "Update Topper" : "Create Topper"}
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
