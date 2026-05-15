import React, { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function BlogFormModal({ isOpen, onClose, blog, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "",
    category: "",
    tags: "",
    isPublished: false,
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);

  const isEditMode = !!blog;

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

  // Initialize Quill editor when modal opens
  useEffect(() => {
    if (!isOpen || !editorContainerRef.current) return;

    const container = editorContainerRef.current;

    // CLEAN previous instance completely
    container.innerHTML = "";
    quillRef.current = null;

    const quill = new Quill(container, {
      theme: "snow",
      placeholder: "Enter blog content",
    });

    quillRef.current = quill;

    const initialContent = blog?.content || "";

    if (initialContent) {
      quill.clipboard.dangerouslyPasteHTML(initialContent);
    }

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      setFormData((prev) => ({
        ...prev,
        content: html,
      }));
    });

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
      container.innerHTML = "";
    };
  }, [isOpen, blog?._id]);

  // Populate form when modal opens or blog changes
  useEffect(() => {
    if (isOpen) {
      if (blog) {
        setFormData({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          coverImage: blog.coverImage || "",
          author: blog.author || "",
          category: blog.category || "",
          tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
          isPublished: blog.isPublished !== undefined ? blog.isPublished : false,
          order: blog.order || 0,
          isActive: blog.isActive !== undefined ? blog.isActive : true,
        });
      } else {
        setFormData({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImage: "",
          author: "",
          category: "",
          tags: "",
          isPublished: false,
          order: 0,
          isActive: true,
        });
      }
      setError(null);
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen, blog]);

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
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      // Get content from Quill editor if available
      let contentToSave = formData.content;
      if (quillRef.current) {
        contentToSave = quillRef.current.root.innerHTML;
        const textContent = quillRef.current.getText().trim();
        if (!textContent) {
          throw new Error("Content is required");
        }
      } else if (!formData.content.trim() || formData.content === "<p><br></p>") {
        throw new Error("Content is required");
      }

      const url = isEditMode
        ? getApiUrl(`blogs/admin/${blog._id || blog.id}`)
        : getApiUrl("blogs/admin");

      const method = isEditMode ? "PATCH" : "POST";

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const requestBody = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: contentToSave,
        coverImage: formData.coverImage ? formData.coverImage.trim() : "",
        author: formData.author,
        category: formData.category,
        tags: tagsArray,
        isPublished: formData.isPublished,
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
        throw new Error(result.message || "Failed to save blog");
      }

      setToast({
        isVisible: true,
        message:
          result.message ||
          (isEditMode ? "Blog updated successfully" : "Blog created successfully"),
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
            className="rounded-16 shadow-4 d-flex flex-column blog-form-modal-container"
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
              className="close cursor blog-form-modal-close"
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
                {isEditMode ? "Edit Blog" : "Add New Blog"}
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
                    .blog-form-modal-container input::placeholder,
                    .blog-form-modal-container textarea::placeholder {
                      color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
                    }
                    .blog-form-modal-container input:focus,
                    .blog-form-modal-container textarea:focus,
                    .blog-form-modal-container select:focus {
                      outline: none;
                      border-color: #6366f1 !important;
                      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }
                  `}
                </style>

                {/* Title */}
                <div className="col-12">
                  <label className={labelClass}>
                    Title <span className="text-red-1">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter blog title"
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

                {/* Excerpt */}
                <div className="col-12">
                  <label className={labelClass}>Excerpt</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Short summary of the blog"
                    rows="3"
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                {/* Content - Quill */}
                <div
                  className="col-12"
                  style={{ position: "relative", zIndex: 1, marginBottom: "50px" }}
                >
                  <label className={labelClass}>
                    Content <span className="text-red-1">*</span>
                  </label>
                  <div
                    ref={editorContainerRef}
                    style={{
                      backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                      border: isDarkMode
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid #DDDDDD",
                      borderRadius: "8px",
                      minHeight: "200px",
                      position: "relative",
                      zIndex: 1,
                      overflow: "visible",
                    }}
                  />
                  <style>
                    {`
                      .ql-container {
                        font-family: inherit;
                        font-size: 15px;
                        color: ${isDarkMode ? "#ffffff" : "#000000"};
                        position: relative;
                        z-index: 1;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                        border-top: none;
                      }
                      .ql-editor {
                        min-height: 200px;
                        color: ${isDarkMode ? "#ffffff" : "#000000"};
                      }
                      .ql-toolbar {
                        background-color: ${isDarkMode ? "#1a0d3a" : "#f8f9fa"};
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                        border-bottom: ${
                          isDarkMode
                            ? "1px solid rgba(255, 255, 255, 0.1)"
                            : "1px solid #DDDDDD"
                        };
                        position: relative;
                        z-index: 1;
                      }
                      .ql-stroke { stroke: ${isDarkMode ? "#ffffff" : "#000000"}; }
                      .ql-fill { fill: ${isDarkMode ? "#ffffff" : "#000000"}; }
                      .ql-picker-label { color: ${isDarkMode ? "#ffffff" : "#000000"}; }
                      .ql-snow .ql-picker.ql-expanded .ql-picker-label {
                        color: ${isDarkMode ? "#ffffff" : "#000000"};
                      }
                      .ql-snow .ql-picker-options {
                        background-color: ${isDarkMode ? "#2B1C55" : "#ffffff"};
                        border: ${
                          isDarkMode
                            ? "1px solid rgba(255, 255, 255, 0.1)"
                            : "1px solid #DDDDDD"
                        };
                        z-index: 1000 !important;
                        position: absolute !important;
                        max-height: 200px !important;
                        overflow-y: auto !important;
                      }
                      .ql-snow .ql-picker-item { color: ${isDarkMode ? "#ffffff" : "#000000"}; }
                      .ql-snow .ql-picker-item:hover {
                        background-color: ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#f0f0f0"};
                      }
                      .ql-tooltip { z-index: 1001 !important; }
                    `}
                  </style>
                </div>

                {/* Cover Image */}
                <div className="col-12" style={{ position: "relative", zIndex: 2 }}>
                  <div className="d-flex items-center justify-between mb-10">
                    <label
                      className={`text-16 lh-1 fw-500 d-block ${
                        isDarkMode ? "text-white" : "text-dark-1"
                      }`}
                    >
                      Cover Image (Optional)
                    </label>
                    <label
                      htmlFor="blogCoverUpload"
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
                        id="blogCoverUpload"
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

                {/* Author */}
                <div className="col-lg-6">
                  <label className={labelClass}>Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Author name"
                    style={inputStyle}
                  />
                </div>

                {/* Category */}
                <div className="col-lg-6">
                  <label className={labelClass}>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Exam Tips"
                    style={inputStyle}
                  />
                </div>

                {/* Tags */}
                <div className="col-12">
                  <label className={labelClass}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., physics, jee, study"
                    style={inputStyle}
                  />
                </div>

                {/* Checkboxes */}
                <div className="col-12">
                  <div className="row y-gap-10">
                    <div className="col-auto">
                      <label className="d-flex items-center cursor">
                        <input
                          type="checkbox"
                          name="isPublished"
                          checked={formData.isPublished}
                          onChange={handleChange}
                          className="mr-10"
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span
                          className={`text-16 fw-500 ${
                            isDarkMode ? "text-white" : "text-dark-1"
                          }`}
                        >
                          Is Published
                        </span>
                      </label>
                    </div>
                    {isEditMode && (
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
                    )}
                  </div>
                </div>

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
                    {loading ? "Saving..." : isEditMode ? "Update Blog" : "Create Blog"}
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
