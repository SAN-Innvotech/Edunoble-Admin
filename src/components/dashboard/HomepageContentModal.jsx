import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { createPortal } from "react-dom";
import Toast from "../common/Toast";

export default function HomepageContentModal({ isOpen, onClose, section, sectionData, homepageId, onSuccess }) {
  const { auth } = useContextElement();
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Initialize form data based on section
  useEffect(() => {
    if (isOpen && sectionData) {
      const initialData = { ...sectionData };
      
      // Handle nested structures
      if (section === "hero" && initialData.hero) {
        setFormData({
          headline: initialData.hero.headline || "",
          subheading: initialData.hero.subheading || "",
          description: initialData.hero.description || "",
          pictureUrl1: initialData.hero.pictureUrl1 || "",
          pictureUrl2: initialData.hero.pictureUrl2 || "",
          pictureUrl3: initialData.hero.pictureUrl3 || "",
          feature1: initialData.hero.features?.feature1 || "",
          feature2: initialData.hero.features?.feature2 || "",
          feature3: initialData.hero.features?.feature3 || "",
          samplePaperCount: initialData.hero.samplePaperCount || "",
          studentReviewName: initialData.hero.studentReview?.name || "",
          studentReviewClass: initialData.hero.studentReview?.class || "",
          studentReviewImageUrl: initialData.hero.studentReview?.imageUrl || "",
          logo: initialData.hero.logo || "",
        });
      } else if (section === "mostViewedPapers" && initialData.mostViewedPapers) {
        setFormData({
          heading: initialData.mostViewedPapers.heading || "",
          description: initialData.mostViewedPapers.description || "",
        });
      } else if (section === "featuredPapers" && initialData.featuredPapers) {
        setFormData({
          heading: initialData.featuredPapers.heading || "",
          description: initialData.featuredPapers.description || "",
        });
      } else if (section === "studentsSay" && initialData.studentsSay) {
        setFormData({
          heading: initialData.studentsSay.heading || "",
          description: initialData.studentsSay.description || "",
        });
      } else if (section === "features" && initialData.features) {
        setFormData({
          heading: initialData.features.heading || "",
          description: initialData.features.description || "",
          ctaButtonText: initialData.features.ctaButtonText || "",
          imageUrl: initialData.features.imageUrl || "",
          featureList: initialData.features.featureList?.map(f => f.text || "") || [""],
        });
      } else if (section === "process" && initialData.process) {
        const existingSteps = initialData.process.steps?.map(step => ({
          stepNumber: step.stepNumber || "",
          title: step.title || "",
          description: step.description || "",
          order: step.order || 0,
          _id: step._id || null,
        })) || [];
        
        // Ensure exactly 3 steps
        let steps = [...existingSteps];
        while (steps.length < 3) {
          steps.push({ stepNumber: "", title: "", description: "", order: steps.length + 1, _id: null });
        }
        if (steps.length > 3) {
          steps = steps.slice(0, 3);
        }
        
        setFormData({
          heading: initialData.process.heading || "",
          subtitle: initialData.process.subtitle || "",
          steps: steps,
        });
      } else if (section === "statistics" && initialData.statistics) {
        setFormData({
          statistics: initialData.statistics.map(stat => ({
            number: stat.number || "",
            label: stat.label || "",
            order: stat.order || 0,
            _id: stat._id || null,
          })),
        });
      } else {
        setFormData(initialData);
      }
      
      setError(null);
      setToast({ isVisible: false, message: "", type: "success" });
    }
  }, [isOpen, section, sectionData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedChange = (field, subField, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value,
      },
    }));
  };

  const handleArrayChange = (field, index, subField, value) => {
    setFormData((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray[index] = {
        ...newArray[index],
        [subField]: value,
      };
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleAddArrayItem = (field, defaultItem) => {
    // Prevent adding if it's process steps and there are already 3 steps
    if (field === "steps" && (formData.steps || []).length >= 3) {
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultItem],
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    // Prevent removal if it's process steps and there are only 3 steps
    if (field === "steps" && (formData.steps || []).length <= 3) {
      return;
    }
    
    setFormData((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        isVisible: true,
        message: "Please select a valid image file",
        type: "error",
      });
      return;
    }

    setUploadLoading(true);

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

      setFormData((prev) => ({
        ...prev,
        [fieldName]: result.data?.imageUrl || "",
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

  const buildRequestBody = () => {
    switch (section) {
      case "hero":
        return {
          hero: {
            headline: formData.headline || "",
            subheading: formData.subheading || "",
            description: formData.description || "",
            pictureUrl1: formData.pictureUrl1 || "",
            pictureUrl2: formData.pictureUrl2 || "",
            pictureUrl3: formData.pictureUrl3 || "",
            features: {
              feature1: formData.feature1 || "",
              feature2: formData.feature2 || "",
              feature3: formData.feature3 || "",
            },
            samplePaperCount: formData.samplePaperCount || "",
            studentReview: {
              name: formData.studentReviewName || "",
              class: formData.studentReviewClass || "",
              imageUrl: formData.studentReviewImageUrl || "",
            },
            logo: formData.logo || "",
          },
        };
      case "mostViewedPapers":
        return {
          mostViewedPapers: {
            heading: formData.heading || "",
            description: formData.description || "",
          },
        };
      case "featuredPapers":
        return {
          featuredPapers: {
            heading: formData.heading || "",
            description: formData.description || "",
          },
        };
      case "studentsSay":
        return {
          studentsSay: {
            heading: formData.heading || "",
            description: formData.description || "",
          },
        };
      case "features":
        return {
          features: {
            heading: formData.heading || "",
            description: formData.description || "",
            ctaButtonText: formData.ctaButtonText || "",
            imageUrl: formData.imageUrl || "",
            featureList: (formData.featureList || [])
              .filter(text => text.trim())
              .map(text => ({ text: text.trim() })),
          },
        };
      case "process":
        return {
          process: {
            heading: formData.heading || "",
            subtitle: formData.subtitle || "",
            steps: (formData.steps || []).map(step => ({
              stepNumber: step.stepNumber || "",
              title: step.title || "",
              description: step.description || "",
              order: parseInt(step.order) || 0,
            })),
          },
        };
      case "statistics":
        return {
          statistics: (formData.statistics || []).map(stat => ({
            number: stat.number || "",
            label: stat.label || "",
            order: parseInt(stat.order) || 0,
          })),
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setToast({ isVisible: false, message: "", type: "success" });

    try {
      // Validate process steps - must have exactly 3
      if (section === "process") {
        const steps = formData.steps || [];
        if (steps.length !== 3) {
          throw new Error("Process section must have exactly 3 steps");
        }
        // Validate that all steps have required fields
        for (let i = 0; i < steps.length; i++) {
          if (!steps[i].stepNumber?.trim() || !steps[i].title?.trim() || !steps[i].description?.trim()) {
            throw new Error(`Step ${i + 1} must have step number, title, and description`);
          }
        }
      }

      const requestBody = buildRequestBody();

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl(`homepage/admin/${homepageId}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to update homepage content");
      }

      setToast({
        isVisible: true,
        message: result.message || "Homepage content updated successfully",
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

  const renderFormFields = () => {
    switch (section) {
      case "hero":
        return (
          <>
            <div className="col-12">
              <div className="d-flex items-center justify-between mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Logo
                </label>
                <label
                  htmlFor="logoUpload"
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
                >
                  {uploadLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  )}
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logo")}
                    disabled={uploadLoading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <input
                type="url"
                name="logo"
                value={formData.logo || ""}
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline || ""}
                onChange={handleChange}
                placeholder="Enter headline"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Subheading
              </label>
              <input
                type="text"
                name="subheading"
                value={formData.subheading || ""}
                onChange={handleChange}
                placeholder="Enter subheading"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter description"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Sample Paper Count
              </label>
              <input
                type="text"
                name="samplePaperCount"
                value={formData.samplePaperCount || ""}
                onChange={handleChange}
                placeholder="e.g., 1000+"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Feature 1
              </label>
              <input
                type="text"
                name="feature1"
                value={formData.feature1 || ""}
                onChange={handleChange}
                placeholder="Enter feature 1"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Feature 2
              </label>
              <input
                type="text"
                name="feature2"
                value={formData.feature2 || ""}
                onChange={handleChange}
                placeholder="Enter feature 2"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Feature 3
              </label>
              <input
                type="text"
                name="feature3"
                value={formData.feature3 || ""}
                onChange={handleChange}
                placeholder="Enter feature 3"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Student Review Name
              </label>
              <input
                type="text"
                name="studentReviewName"
                value={formData.studentReviewName || ""}
                onChange={handleChange}
                placeholder="Enter student name"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Student Review Class
              </label>
              <input
                type="text"
                name="studentReviewClass"
                value={formData.studentReviewClass || ""}
                onChange={handleChange}
                placeholder="e.g., Class 12th Student"
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

            <div className="col-12">
              <div className="d-flex items-center justify-between mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Student Review Image URL
                </label>
                <label
                  htmlFor="studentReviewImageUpload"
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
                >
                  {uploadLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  )}
                  <input
                    id="studentReviewImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "studentReviewImageUrl")}
                    disabled={uploadLoading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <input
                type="url"
                name="studentReviewImageUrl"
                value={formData.studentReviewImageUrl || ""}
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

            <div className="col-12">
              <div className="d-flex items-center justify-between mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Picture URL 1
                </label>
                <label
                  htmlFor="pictureUrl1Upload"
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
                >
                  {uploadLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  )}
                  <input
                    id="pictureUrl1Upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "pictureUrl1")}
                    disabled={uploadLoading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <input
                type="url"
                name="pictureUrl1"
                value={formData.pictureUrl1 || ""}
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

            <div className="col-12">
              <div className="d-flex items-center justify-between mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Picture URL 2
                </label>
                <label
                  htmlFor="pictureUrl2Upload"
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
                >
                  {uploadLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  )}
                  <input
                    id="pictureUrl2Upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "pictureUrl2")}
                    disabled={uploadLoading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <input
                type="url"
                name="pictureUrl2"
                value={formData.pictureUrl2 || ""}
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

            <div className="col-12">
              <div className="d-flex items-center justify-between mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Picture URL 3
                </label>
                <label
                  htmlFor="pictureUrl3Upload"
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
                >
                  {uploadLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  )}
                  <input
                    id="pictureUrl3Upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "pictureUrl3")}
                    disabled={uploadLoading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <input
                type="url"
                name="pictureUrl3"
                value={formData.pictureUrl3 || ""}
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
          </>
        );
      case "mostViewedPapers":
      case "featuredPapers":
      case "studentsSay":
        return (
          <>
            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading || ""}
                onChange={handleChange}
                placeholder="Enter heading"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter description"
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
          </>
        );
      case "features":
        return (
          <>
            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading || ""}
                onChange={handleChange}
                placeholder="Enter heading"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter description"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                CTA Button Text
              </label>
              <input
                type="text"
                name="ctaButtonText"
                value={formData.ctaButtonText || ""}
                onChange={handleChange}
                placeholder="Enter CTA button text"
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

            <div className="col-12">
              <div className="d-flex items-center justify-between mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Image URL
                </label>
                <label
                  htmlFor="featuresImageUpload"
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
                >
                  {uploadLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  )}
                  <input
                    id="featuresImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "imageUrl")}
                    disabled={uploadLoading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl || ""}
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

            <div className="col-12">
              <div className="d-flex justify-between items-center mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Feature List
                </label>
                <button
                  type="button"
                  onClick={() => handleAddArrayItem("featureList", "")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Add Feature
                </button>
              </div>
              {(formData.featureList || []).map((text, index) => (
                <div key={index} className="row y-gap-10 mb-10">
                  <div className="col">
                    <input
                      type="text"
                      value={text || ""}
                      onChange={(e) => {
                        const newList = [...(formData.featureList || [])];
                        newList[index] = e.target.value;
                        setFormData((prev) => ({ ...prev, featureList: newList }));
                      }}
                      placeholder="Enter feature text"
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
                  <div className="col-auto">
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem("featureList", index)}
                      className="button -md -outline-red-1 text-red-1"
                      style={{
                        border: "1px solid #ef4444",
                        background: "transparent",
                        color: "#ef4444",
                        borderRadius: "8px",
                        padding: "15px 20px",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case "process":
        return (
          <>
            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading || ""}
                onChange={handleChange}
                placeholder="Enter heading"
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

            <div className="col-12">
              <label className={`text-16 lh-1 fw-500 mb-10 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                Subtitle
              </label>
              <textarea
                name="subtitle"
                value={formData.subtitle || ""}
                onChange={handleChange}
                placeholder="Enter subtitle"
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

            <div className="col-12">
              <div className="d-flex justify-between items-center mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Steps <span className="text-red-1">*</span> <span className={`text-14 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>(Exactly 3 steps required)</span>
                </label>
                {(formData.steps || []).length < 3 && (
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem("steps", { stepNumber: "", title: "", description: "", order: 0, _id: null })}
                    className="button -md -outline-purple-1 text-purple-1"
                    style={{
                      border: "1px solid #6366f1",
                      background: "transparent",
                      color: "#6366f1",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Add Step
                  </button>
                )}
              </div>
              {(formData.steps || []).map((step, index) => (
                <div key={index} className="mb-20 p-20 px-10 py-5 rounded-8" style={{ backgroundColor: isDarkMode ? "#2B1C55" : "#f5f5f5", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD" }}>
                  <div className="row y-gap-15">
                    <div className="col-lg-3">
                      <label className={`text-14 fw-500 mb-5 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        Step Number
                      </label>
                      <input
                        type="text"
                        value={step.stepNumber || ""}
                        onChange={(e) => handleArrayChange("steps", index, "stepNumber", e.target.value)}
                        placeholder="e.g., 01"
                        style={{
                          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          width: "100%",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                    </div>
                    <div className="col-lg-3">
                      <label className={`text-14 fw-500 mb-5 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        Order
                      </label>
                      <input
                        type="number"
                        value={step.order !== undefined && step.order !== null ? step.order : ""}
                        onChange={(e) => handleArrayChange("steps", index, "order", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        style={{
                          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          width: "100%",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className={`text-14 fw-500 mb-5 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={step.title || ""}
                        onChange={(e) => handleArrayChange("steps", index, "title", e.target.value)}
                        placeholder="Enter step title"
                        style={{
                          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          width: "100%",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <label className={`text-14 fw-500 mb-5 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        Description
                      </label>
                      <textarea
                        value={step.description || ""}
                        onChange={(e) => handleArrayChange("steps", index, "description", e.target.value)}
                        placeholder="Enter step description"
                        rows="2"
                        style={{
                          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          width: "100%",
                          resize: "vertical",
                          fontFamily: "inherit",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                    </div>
                    {(formData.steps || []).length > 3 && (
                      <div className="col-12">
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem("steps", index)}
                          className="button -md -outline-red-1 text-red-1"
                          style={{
                            border: "1px solid #ef4444",
                            background: "transparent",
                            color: "#ef4444",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                          Remove Step
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case "statistics":
        return (
          <>
            <div className="col-12">
              <div className="d-flex justify-between items-center mb-10">
                <label className={`text-16 lh-1 fw-500 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Statistics
                </label>
                <button
                  type="button"
                  onClick={() => handleAddArrayItem("statistics", { number: "", label: "", order: 0, _id: null })}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Add Statistic
                </button>
              </div>
              {(formData.statistics || []).map((stat, index) => (
                <div key={index} className="mb-20 p-20 px-10 py-5 rounded-8" style={{ backgroundColor: isDarkMode ? "#2B1C55" : "#f5f5f5", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD" }}>
                  <div className="row y-gap-15">
                    <div className="col-lg-4">
                      <label className={`text-14 fw-500 mb-5 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        Number
                      </label>
                      <input
                        type="text"
                        value={stat.number || ""}
                        onChange={(e) => handleArrayChange("statistics", index, "number", e.target.value)}
                        placeholder="e.g., 10,000+"
                        style={{
                          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          width: "100%",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                    </div>
                    <div className="col-lg-4">
                      <label className={`text-14 fw-500 mb-5 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        Label
                      </label>
                      <input
                        type="text"
                        value={stat.label || ""}
                        onChange={(e) => handleArrayChange("statistics", index, "label", e.target.value)}
                        placeholder="Enter label"
                        style={{
                          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          width: "100%",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                    </div>
                    <div className="col-lg-2">
                      <label className={`text-14 fw-500 mb-5 d-block ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        Order
                      </label>
                      <input
                        type="number"
                        value={stat.order !== undefined && stat.order !== null ? stat.order : ""}
                        onChange={(e) => handleArrayChange("statistics", index, "order", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        style={{
                          backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          width: "100%",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                    </div>
                    <div className="col-lg-2 d-flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem("statistics", index)}
                        className="button -md -outline-red-1 text-red-1"
                        style={{
                          border: "1px solid #ef4444",
                          background: "transparent",
                          color: "#ef4444",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          fontSize: "14px",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    const titles = {
      hero: "Hero Section",
      mostViewedPapers: "Most Viewed Papers",
      featuredPapers: "Featured Papers",
      studentsSay: "Students Say",
      features: "Features",
      process: "Process",
      statistics: "Statistics",
    };
    return titles[section] || "Edit Section";
  };

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
            className="rounded-16 shadow-4 d-flex flex-column homepage-content-modal-container"
            style={{
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              backgroundColor: isDarkMode ? "#140342" : "#ffffff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="close cursor homepage-content-modal-close"
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
                Edit {getSectionTitle()}
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
                    .homepage-content-modal-container input::placeholder,
                    .homepage-content-modal-container textarea::placeholder {
                      color: ${isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#999"} !important;
                    }
                    .homepage-content-modal-container input:focus,
                    .homepage-content-modal-container textarea:focus,
                    .homepage-content-modal-container select:focus {
                      outline: none;
                      border-color: #6366f1 !important;
                      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    }
                  `}
                </style>

                {renderFormFields()}

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
                    {loading ? "Updating..." : "Update"}
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
