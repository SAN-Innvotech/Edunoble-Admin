import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

// Predefined options for dropdowns
const CLASS_OPTIONS = ["8", "9", "10", "11", "12"];
const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "History",
  "Geography",
  "Economics",
  "Accountancy",
  "Hindi",
  "Sanskrit",
  "Social Science",
  "Economics",
];
const BOARD_OPTIONS = ["CBSE", "ICSE", "ISC", "State Board", "IB", "IGCSE"];
const EXAM_TYPE_OPTIONS = [
  "Sample Paper",
  "Pre-board",
  "Board Exam",
  "Unit Test",
  "Class Test",
  "Mock Test",
  "Mid-term",
  "Final",
];

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
    classOther: "",
    subject: "",
    subjectOther: "",
    year: new Date().getFullYear(),
    description: "",
    board: "",
    boardOther: "",
    examType: "",
    examTypeOther: "",
    tags: [],
    fileUrl: "",
    featured: false,
    isActive: true,
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isEditMode = !!paper;

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

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (paper) {
        // Populate form with existing paper data
        const paperClassInOptions = CLASS_OPTIONS.includes(paper.class);
        const paperSubjectInOptions = SUBJECT_OPTIONS.includes(paper.subject);
        const paperBoardInOptions = BOARD_OPTIONS.includes(paper.board);
        const paperExamTypeInOptions = EXAM_TYPE_OPTIONS.includes(paper.examType);

        setFormData({
          title: paper.title || "",
          class: paperClassInOptions ? paper.class || "" : "Other",
          classOther: paperClassInOptions ? "" : paper.class || "",
          subject: paperSubjectInOptions ? paper.subject || "" : "Other",
          subjectOther: paperSubjectInOptions ? "" : paper.subject || "",
          year: paper.year || new Date().getFullYear(),
          description: paper.description || "",
          board: paperBoardInOptions ? paper.board || "" : "Other",
          boardOther: paperBoardInOptions ? "" : paper.board || "",
          examType: paperExamTypeInOptions ? paper.examType || "" : "Other",
          examTypeOther: paperExamTypeInOptions ? "" : paper.examType || "",
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
          classOther: "",
          subject: "",
          subjectOther: "",
          year: new Date().getFullYear(),
          description: "",
          board: "",
          boardOther: "",
          examType: "",
          examTypeOther: "",
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
      const finalClass = formData.class === "Other" ? formData.classOther.trim() : formData.class;
      const finalSubject =
        formData.subject === "Other" ? formData.subjectOther.trim() : formData.subject;
      const finalBoard = formData.board === "Other" ? formData.boardOther.trim() : formData.board;
      const finalExamType =
        formData.examType === "Other" ? formData.examTypeOther.trim() : formData.examType;

      // Validate required fields
      if (
        !formData.title ||
        !finalClass ||
        !finalSubject ||
        !formData.fileUrl
      ) {
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
          class: finalClass,
          subject: finalSubject,
          year: parseInt(formData.year),
          description: formData.description,
          board: finalBoard,
          examType: finalExamType,
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
        className="paper-form-modal-container"
        style={{
          position: "relative",
          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
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
            className="close cursor paper-form-modal-close"
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
              .paper-form-modal input::placeholder,
              .paper-form-modal textarea::placeholder {
                color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
              }
            `}
          </style>
          <h2 className={`text-24 lh-1 fw-700 mb-30 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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

            {/* Class and Subject */}
            <div className="col-lg-6">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Class <span className="text-red-1">*</span>
              </label>
              <select
                required
                name="class"
                value={formData.class}
                onChange={handleChange}
                style={{
                  backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDarkMode ? "white" : "%23333"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              >
                <option value="">Select Class</option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {formData.class === "Other" && (
                <input
                  type="text"
                  name="classOther"
                  value={formData.classOther}
                  onChange={handleChange}
                  placeholder="Enter class"
                  className="mt-10"
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
              )}
            </div>

            <div className="col-lg-6">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Subject <span className="text-red-1">*</span>
              </label>
              <select
                required
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{
                  backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDarkMode ? "white" : "%23333"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              >
                <option value="">Select Subject</option>
                {SUBJECT_OPTIONS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {formData.subject === "Other" && (
                <input
                  type="text"
                  name="subjectOther"
                  value={formData.subjectOther}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  className="mt-10"
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
              )}
            </div>

            {/* Year, Board, Exam Type */}
            <div className="col-lg-4">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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

            <div className="col-lg-4">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Board
              </label>
              <select
                name="board"
                value={formData.board}
                onChange={handleChange}
                style={{
                  backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDarkMode ? "white" : "%23333"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              >
                <option value="">Select Board</option>
                {BOARD_OPTIONS.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {formData.board === "Other" && (
                <input
                  type="text"
                  name="boardOther"
                  value={formData.boardOther}
                  onChange={handleChange}
                  placeholder="Enter board"
                  className="mt-10"
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
              )}
            </div>

            <div className="col-lg-4">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Exam Type
              </label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                style={{
                  backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                  borderRadius: "8px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  width: "100%",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDarkMode ? "white" : "%23333"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center",
                  paddingRight: "45px",
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              >
                <option value="">Select Exam Type</option>
                {EXAM_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {formData.examType === "Other" && (
                <input
                  type="text"
                  name="examTypeOther"
                  value={formData.examTypeOther}
                  onChange={handleChange}
                  placeholder="Enter exam type"
                  className="mt-10"
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
              )}
            </div>

            {/* Description */}
            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter paper description"
                rows="3"
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

            {/* File URL */}
            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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

            {/* Tags */}
            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
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
                    backgroundColor: isDarkMode ? "#2B1C55" : "#ffffff",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                    borderRadius: "8px",
                    padding: "15px 22px",
                    fontSize: "15px",
                    flex: 1,
                    color: isDarkMode ? "#ffffff" : "#000000",
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

            {/* Featured and Is Active */}
            <div className="col-12">
              <div className="d-flex items-center x-gap-20">
                <label className="d-flex items-center cursor">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="mr-10"
                  />
                  <span className={`text-14 ${isDarkMode ? "text-white" : ""}`}>Featured</span>
                </label>
                {isEditMode && (
                  <label className="d-flex items-center cursor">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="mr-10"
                    />
                    <span className={`text-14 ${isDarkMode ? "text-white" : ""}`}>Is Active</span>
                  </label>
                )}
              </div>
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

