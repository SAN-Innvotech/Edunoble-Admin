import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function PaperFormModal({ isOpen, onClose, paper, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    title: "",
    class: "",
    subject: "",
    year: new Date().getFullYear(),
    description: "",
    board: "",
    examType: "",
    tags: [],
    fileUrl: "",
    featured: false,
    isActive: true,
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Metadata for dropdowns
  const [metadata, setMetadata] = useState({
    classes: [],
    subjects: [],
    boards: [],
    years: [],
    examTypes: [],
  });

  const isEditMode = !!paper;

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(getApiUrl("papers/metadata"));
        if (response.ok) {
          const result = await response.json();
          if (result.isSuccess && result.data) {
            setMetadata({
              classes: result.data.classes || [],
              subjects: result.data.subjects || [],
              boards: result.data.boards || [],
              years: result.data.years || [],
              examTypes: result.data.examTypes || [],
            });
          }
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };

    if (isOpen) {
      fetchMetadata();
      if (paper) {
        // Populate form with existing paper data
        setFormData({
          title: paper.title || "",
          class: paper.class || "",
          subject: paper.subject || "",
          year: paper.year || new Date().getFullYear(),
          description: paper.description || "",
          board: paper.board || "",
          examType: paper.examType || "",
          tags: paper.tags || [],
          fileUrl: paper.fileUrl || "",
          featured: paper.featured || false,
          isActive: paper.isActive !== undefined ? paper.isActive : true,
        });
      } else {
        // Reset form for new paper
        setFormData({
          title: "",
          class: "",
          subject: "",
          year: new Date().getFullYear(),
          description: "",
          board: "",
          examType: "",
          tags: [],
          fileUrl: "",
          featured: false,
          isActive: true,
        });
      }
      setError(null);
      setTagInput("");
    }
  }, [isOpen, paper]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.class || !formData.subject || !formData.fileUrl) {
        throw new Error("Please fill in all required fields");
      }

      const url = isEditMode
        ? getApiUrl(`papers/admin/${paper._id || paper.id}`)
        : getApiUrl("papers/admin");

      const method = isEditMode ? "PATCH" : "POST";

      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization token if available
      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          title: formData.title,
          class: formData.class,
          subject: formData.subject,
          year: parseInt(formData.year),
          description: formData.description,
          board: formData.board,
          examType: formData.examType,
          tags: formData.tags,
          fileUrl: formData.fileUrl,
          featured: formData.featured,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to save paper");
      }

      // Show success toast
      setToast({
        isVisible: true,
        message: result.message || (isEditMode ? "Paper updated successfully" : "Paper created successfully"),
        type: "success",
      });

      // Success - close modal and refresh list
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 500); // Small delay to show toast before closing
    } catch (err) {
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      
      // Show error toast
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
      // Hide toast when modal closes
      setToast({ isVisible: false, message: "", type: "success" });
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
        style={{
          position: "relative",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            overflowY: "auto",
            flex: 1,
          }}
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

          <div className="px-30 py-30">
          <style>
            {`
              .paper-form-modal input:focus,
              .paper-form-modal select:focus,
              .paper-form-modal textarea:focus {
                outline: none;
                border-color: #6366f1 !important;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
              }
              .paper-form-modal select {
                cursor: pointer;
              }
            `}
          </style>
          <h2 className="text-24 lh-1 fw-700 mb-30">
            {isEditMode ? "Edit Paper" : "Add New Paper"}
          </h2>

          {error && (
            <div className="mb-20 p-15 bg-red-1 text-white rounded-8">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form row y-gap-30 paper-form-modal">
            {/* Title */}
            <div className="col-12">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Title <span className="text-red-1">*</span>
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter paper title"
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

            {/* Class and Subject */}
            <div className="col-lg-6">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Class <span className="text-red-1">*</span>
              </label>
              <select
                required
                name="class"
                value={formData.class}
                onChange={handleChange}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                }}
              >
                <option value="">Select Class</option>
                {metadata.classes.map((cls) => (
                  <option key={cls.name} value={cls.name}>
                    Class {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-6">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Subject <span className="text-red-1">*</span>
              </label>
              <select
                required
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                }}
              >
                <option value="">Select Subject</option>
                {metadata.subjects.map((subj) => (
                  <option key={subj.name} value={subj.name}>
                    {subj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year, Board, Exam Type */}
            <div className="col-lg-4">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Year <span className="text-red-1">*</span>
              </label>
              <input
                required
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g., 2024"
                min="2000"
                max="2100"
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

            <div className="col-lg-4">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Board
              </label>
              <select
                name="board"
                value={formData.board}
                onChange={handleChange}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                }}
              >
                <option value="">Select Board</option>
                {metadata.boards.map((board) => (
                  <option key={board.name} value={board.name}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-4">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Exam Type
              </label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                }}
              >
                <option value="">Select Exam Type</option>
                {metadata.examTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter paper description"
                rows="3"
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

            {/* File URL */}
            <div className="col-12">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                File URL <span className="text-red-1">*</span>
              </label>
              <input
                required
                type="url"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder="https://example.com/file.pdf"
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

            {/* Tags */}
            <div className="col-12">
              <label className="text-16 lh-1 fw-500 text-dark-1 mb-10 d-block">
                Tags
              </label>
              <div className="d-flex y-gap-10 mb-10">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Enter tag and press Enter"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #DDDDDD",
                    borderRadius: "8px",
                    padding: "15px 22px",
                    fontSize: "15px",
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="button -md -purple-1 text-white ml-10"
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  Add Tag
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="d-flex flex-wrap x-gap-5 y-gap-5">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-10 py-5 bg-light-3 rounded-8 text-14 d-flex items-center mr-5"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-1 cursor"
                        style={{ border: "none", background: "none" }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Featured */}
            <div className="col-12">
              <label className="d-flex items-center cursor">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-10"
                />
                <span className="text-14">Featured</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="col-12 d-flex justify-end pt-20">
              <button
                type="button"
                onClick={onClose}
                className="button -md -outline-purple-1 text-purple-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button -md -purple-1 text-white ml-10"
                disabled={loading}
              >
                {loading ? "Saving..." : isEditMode ? "Update Paper" : "Create Paper"}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ isVisible: false, message: "", type: "success" })}
      />
    </>
  );
}

