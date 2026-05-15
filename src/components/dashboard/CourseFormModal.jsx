import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function CourseFormModal({ isOpen, onClose, course, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    subject: "",
    classLevel: "",
    mode: "Online",
    duration: "",
    feeRange: "",
    highlights: "",
    coverImage: "",
    enrollCtaText: "",
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isEditMode = !!course;

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

  // Populate form when modal opens or course changes
  useEffect(() => {
    if (isOpen) {
      if (course) {
        setFormData({
          name: course.name || "",
          slug: course.slug || "",
          description: course.description || "",
          longDescription: course.longDescription || "",
          subject: course.subject || "",
          classLevel: course.classLevel || "",
          mode: course.mode || "Online",
          duration: course.duration || "",
          feeRange: course.feeRange || "",
          highlights: Array.isArray(course.highlights)
            ? course.highlights.join("\n")
            : course.highlights || "",
          coverImage: course.coverImage || "",
          enrollCtaText: course.enrollCtaText || "",
          order: course.order || 0,
          isActive: course.isActive !== undefined ? course.isActive : true,
        });
      } else {
        setFormData({
          name: "",
          slug: "",
          description: "",
          longDescription: "",
          subject: "",
          classLevel: "",
          mode: "Online",
          duration: "",
          feeRange: "",
          highlights: "",
          coverImage: "",
          enrollCtaText: "",
          order: 0,
          isActive: true,
        });
      }
      setError(null);
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen, course]);

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

  const handleImageUpload = async (e) => {
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
        coverImage: result.data?.imageUrl || "",
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
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }

      const url = isEditMode
        ? getApiUrl(`courses/admin/${course._id || course.id}`)
        : getApiUrl("courses/admin");

      const method = isEditMode ? "PATCH" : "POST";

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const highlightsArray = formData.highlights
        .split("\n")
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      const requestBody = {
        name: formData.name,
        description: formData.description,
        longDescription: formData.longDescription,
        subject: formData.subject,
        classLevel: formData.classLevel,
        mode: formData.mode,
        duration: formData.duration,
        feeRange: formData.feeRange,
        highlights: highlightsArray,
        coverImage: formData.coverImage ? formData.coverImage.trim() : "",
        enrollCtaText: formData.enrollCtaText,
        order: parseInt(formData.order) || 0,
        ...(formData.slug.trim() && { slug: formData.slug.trim() }),
        ...(isEditMode && { isActive: formData.isActive }),
      };

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to save course");
      }

      setToast({
        isVisible: true,
        message:
          result.message ||
          (isEditMode ? "Course updated successfully" : "Course created successfully"),
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
            className="rounded-16 shadow-4 d-flex flex-column course-form-modal-container"
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
              className="close cursor course-form-modal-close"
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
                {isEditMode ? "Edit Course" : "Add New Course"}
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
                    .course-form-modal-container input::placeholder,
                    .course-form-modal-container textarea::placeholder {
                      color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
                    }
                    .course-form-modal-container input:focus,
                    .course-form-modal-container textarea:focus,
                    .course-form-modal-container select:focus {
                      outline: none;
                      border-color: #6366f1 !important;
                      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }
                    .course-form-modal-container select {
                      cursor: pointer;
                    }
                    .course-form-modal-container select option {
                      background-color: ${isDarkMode ? "#2B1C55" : "#ffffff"};
                      color: ${isDarkMode ? "#ffffff" : "#000000"};
                    }
                  `}
                </style>

                {/* Name */}
                <div className="col-12">
                  <label className={labelClass}>
                    Name <span className="text-red-1">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter course name"
                    style={inputStyle}
                  />
                </div>

                {/* Slug */}
                <div className="col-lg-6">
                  <label className={labelClass}>Slug (Optional)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="auto-generated if left blank"
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

                {/* Description */}
                <div className="col-12">
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short description of the course"
                    rows="3"
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                {/* Long Description */}
                <div className="col-12">
                  <label className={labelClass}>Long Description</label>
                  <textarea
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    placeholder="Detailed description of the course"
                    rows="5"
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                {/* Subject */}
                <div className="col-lg-6">
                  <label className={labelClass}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Physics"
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
                    placeholder="e.g., Class 11 & 12"
                    style={inputStyle}
                  />
                </div>

                {/* Mode */}
                <div className="col-lg-6">
                  <label className={labelClass}>Mode</label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Online & Offline">Online &amp; Offline</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="col-lg-6">
                  <label className={labelClass}>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 6 months"
                    style={inputStyle}
                  />
                </div>

                {/* Fee Range */}
                <div className="col-lg-6">
                  <label className={labelClass}>Fee Range</label>
                  <input
                    type="text"
                    name="feeRange"
                    value={formData.feeRange}
                    onChange={handleChange}
                    placeholder="e.g., ₹10,000 - ₹15,000"
                    style={inputStyle}
                  />
                </div>

                {/* Enroll CTA Text */}
                <div className="col-lg-6">
                  <label className={labelClass}>Enroll CTA Text</label>
                  <input
                    type="text"
                    name="enrollCtaText"
                    value={formData.enrollCtaText}
                    onChange={handleChange}
                    placeholder="e.g., Enroll Now"
                    style={inputStyle}
                  />
                </div>

                {/* Highlights */}
                <div className="col-12">
                  <label className={labelClass}>Highlights (one per line)</label>
                  <textarea
                    name="highlights"
                    value={formData.highlights}
                    onChange={handleChange}
                    placeholder={"Expert faculty\nLive doubt sessions\nWeekly tests"}
                    rows="4"
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                {/* Cover Image */}
                <div className="col-12">
                  <div className="d-flex items-center justify-between mb-10">
                    <label
                      className={`text-16 lh-1 fw-500 d-block ${
                        isDarkMode ? "text-white" : "text-dark-1"
                      }`}
                    >
                      Cover Image (Optional)
                    </label>
                    <label
                      htmlFor="courseCoverUpload"
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
                      title="Upload image (max 5 MB)"
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
                        id="courseCoverUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadLoading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <div className="d-flex items-center" style={{ gap: "12px" }}>
                    {formData.coverImage && (
                      <div
                        style={{
                          position: "relative",
                          width: "80px",
                          height: "60px",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={formData.coverImage}
                          alt="Cover"
                          style={{
                            width: "80px",
                            height: "60px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: isDarkMode
                              ? "1px solid rgba(255, 255, 255, 0.15)"
                              : "1px solid #DDDDDD",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          title="Remove image"
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
                    )}
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg or use the upload icon"
                      style={{ ...inputStyle, flex: 1, width: "auto" }}
                    />
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
                    {loading ? "Saving..." : isEditMode ? "Update Course" : "Create Course"}
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
