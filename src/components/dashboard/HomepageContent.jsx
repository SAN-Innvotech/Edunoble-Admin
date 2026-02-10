import React, { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import HomepageContentModal from "./HomepageContentModal";

export default function HomepageContent() {
  const { auth } = useContextElement();
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

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

  const fetchHomepageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl("homepage"), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch homepage data: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        setHomepageData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch homepage data");
      }
    } catch (err) {
      console.error("Error fetching homepage data:", err);
      setError(err.message);
      setHomepageData(null);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  const handleEdit = (section) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSection(null);
  };

  const handleModalSuccess = () => {
    fetchHomepageData();
  };

  if (loading) {
    return (
      <div className="dashboard__main">
        <div className="dashboard__content bg-light-4">
          <div className="row pb-50 mb-10 justify-center items-center" style={{ minHeight: "400px" }}>
            <div className="col-auto">
              <div className="text-16">Loading homepage content...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__main">
        <div className="dashboard__content bg-light-4">
          <div className="row pb-50 mb-10">
            <div className="col-12">
              <div className="p-20 bg-red-1 text-white rounded-8">
                Error: {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!homepageData) {
    return (
      <div className="dashboard__main">
        <div className="dashboard__content bg-light-4">
          <div className="row pb-50 mb-10">
            <div className="col-12">
              <div className="text-16">No homepage data available</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10 justify-between items-center">
          <div className="col-auto">
            <h1 className={`text-30 lh-12 fw-700 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
              Homepage Content
            </h1>
            <div className={`mt-10 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
              Manage and edit all homepage content sections.
            </div>
          </div>
        </div>

        <div className="row y-gap-30">
          {/* Hero Section */}
          <div className="col-12">
            <div
              className="rounded-16 p-30 px-20 py-20"
              style={{
                backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
              }}
            >
              <div className="d-flex justify-between items-center mb-20">
                <h2 className={`text-20 fw-600 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Hero Section
                </h2>
                <button
                  onClick={() => handleEdit("hero")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="row y-gap-20">
                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Logo
                  </div>
                  {homepageData.hero?.logo && (
                    <div className="mt-10">
                      <img
                        src={homepageData.hero.logo}
                        alt="Logo"
                        style={{ maxWidth: "100px", borderRadius: "8px" }}
                      />
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Headline
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.hero?.headline || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Subheading
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.hero?.subheading || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Description
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.hero?.description || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Features
                  </div>
                  <div className="row x-gap-10 y-gap-10">
                    {homepageData.hero?.features && (
                      <>
                        <div className={`col-auto px-15 py-8 mr-8 rounded-8 ${isDarkMode ? "bg-dark-2" : "bg-light-3"}`}>
                          <span className={`text-14 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                            {homepageData.hero.features.feature1 || "N/A"}
                          </span>
                        </div>
                        <div className={`col-auto px-15 py-8 mr-8 rounded-8 ${isDarkMode ? "bg-dark-2" : "bg-light-3"}`}>
                          <span className={`text-14 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                            {homepageData.hero.features.feature2 || "N/A"}
                          </span>
                        </div>
                        <div className={`col-auto px-15 py-8 rounded-8 ${isDarkMode ? "bg-dark-2" : "bg-light-3"}`}>
                          <span className={`text-14 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                            {homepageData.hero.features.feature3 || "N/A"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Sample Paper Count
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.hero?.samplePaperCount || "N/A"}
                  </div>
                </div>

                

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Student Review
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.hero?.studentReview?.name || "N/A"} - {homepageData.hero?.studentReview?.class || "N/A"}
                  </div>
                  {homepageData.hero?.studentReview?.imageUrl && (
                    <div className="mt-10">
                      <img
                        src={homepageData.hero.studentReview.imageUrl}
                        alt="Student"
                        style={{ maxWidth: "100px", borderRadius: "8px" }}
                      />
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-10 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Picture URLs
                  </div>
                  <div className="row y-gap-15">
                    {homepageData.hero?.pictureUrl1 && (
                      <div className="col-lg-4 col-md-6 col-12">
                        <div className={`text-12 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>Picture 1:</div>
                        <a
                          href={homepageData.hero.pictureUrl1}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block" }}
                        >
                          <img
                            src={homepageData.hero.pictureUrl1}
                            alt="Picture 1"
                            style={{
                              width: "100%",
                              maxWidth: "300px",
                              height: "auto",
                              borderRadius: "8px",
                              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              const urlDiv = e.target.parentElement.querySelector(".image-url-fallback");
                              if (urlDiv) urlDiv.style.display = "block";
                            }}
                          />
                          <div
                            className={`text-12 mt-5 image-url-fallback ${isDarkMode ? "text-purple-1" : "text-purple-1"}`}
                            style={{ display: "none", wordBreak: "break-all" }}
                          >
                            {homepageData.hero.pictureUrl1}
                          </div>
                        </a>
                      </div>
                    )}
                    {homepageData.hero?.pictureUrl2 && (
                      <div className="col-lg-4 col-md-6 col-12">
                        <div className={`text-12 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>Picture 2:</div>
                        <a
                          href={homepageData.hero.pictureUrl2}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block" }}
                        >
                          <img
                            src={homepageData.hero.pictureUrl2}
                            alt="Picture 2"
                            style={{
                              width: "100%",
                              maxWidth: "300px",
                              height: "auto",
                              borderRadius: "8px",
                              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              const urlDiv = e.target.parentElement.querySelector(".image-url-fallback");
                              if (urlDiv) urlDiv.style.display = "block";
                            }}
                          />
                          <div
                            className={`text-12 mt-5 image-url-fallback ${isDarkMode ? "text-purple-1" : "text-purple-1"}`}
                            style={{ display: "none", wordBreak: "break-all" }}
                          >
                            {homepageData.hero.pictureUrl2}
                          </div>
                        </a>
                      </div>
                    )}
                    {homepageData.hero?.pictureUrl3 && (
                      <div className="col-lg-4 col-md-6 col-12">
                        <div className={`text-12 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>Picture 3:</div>
                        <a
                          href={homepageData.hero.pictureUrl3}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "block" }}
                        >
                          <img
                            src={homepageData.hero.pictureUrl3}
                            alt="Picture 3"
                            style={{
                              width: "100%",
                              maxWidth: "300px",
                              height: "auto",
                              borderRadius: "8px",
                              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              const urlDiv = e.target.parentElement.querySelector(".image-url-fallback");
                              if (urlDiv) urlDiv.style.display = "block";
                            }}
                          />
                          <div
                            className={`text-12 mt-5 image-url-fallback ${isDarkMode ? "text-purple-1" : "text-purple-1"}`}
                            style={{ display: "none", wordBreak: "break-all" }}
                          >
                            {homepageData.hero.pictureUrl3}
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Most Viewed Papers */}
          <div className="col-12">
            <div
              className="rounded-16 p-30 px-20 py-20"
              style={{
                backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
              }}
            >
              <div className="d-flex justify-between items-center mb-20">
                <h2 className={`text-20 fw-600 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Most Viewed Papers
                </h2>
                <button
                  onClick={() => handleEdit("mostViewedPapers")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="row y-gap-20">
                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Heading
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.mostViewedPapers?.heading || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Description
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.mostViewedPapers?.description || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Papers */}
          <div className="col-12">
            <div
              className="rounded-16 p-30 px-20 py-20"
              style={{
                backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
              }}
            >
              <div className="d-flex justify-between items-center mb-20">
                <h2 className={`text-20 fw-600 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Featured Papers
                </h2>
                <button
                  onClick={() => handleEdit("featuredPapers")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="row y-gap-20">
                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Heading
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.featuredPapers?.heading || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Description
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.featuredPapers?.description || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Students Say */}
          <div className="col-12">
            <div
              className="rounded-16 p-30 px-20 py-20"
              style={{
                backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
              }}
            >
              <div className="d-flex justify-between items-center mb-20">
                <h2 className={`text-20 fw-600 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Students Say
                </h2>
                <button
                  onClick={() => handleEdit("studentsSay")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="row y-gap-20">
                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Heading
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.studentsSay?.heading || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Description
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.studentsSay?.description || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="col-12">
            <div
              className="rounded-16 p-30 px-20 py-20"
              style={{
                backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
              }}
            >
              <div className="d-flex justify-between items-center mb-20">
                <h2 className={`text-20 fw-600 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Features
                </h2>
                <button
                  onClick={() => handleEdit("features")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="row y-gap-20">
                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Heading
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.features?.heading || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Description
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.features?.description || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    CTA Button Text
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.features?.ctaButtonText || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-10 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Image URL
                  </div>
                  {homepageData.features?.imageUrl ? (
                    <a
                      href={homepageData.features.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "block" }}
                    >
                      <img
                        src={homepageData.features.imageUrl}
                        alt="Features"
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          height: "auto",
                          borderRadius: "8px",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          const urlDiv = e.target.parentElement.querySelector(".image-url-fallback");
                          if (urlDiv) urlDiv.style.display = "block";
                        }}
                      />
                      <div
                        className={`text-12 mt-5 image-url-fallback ${isDarkMode ? "text-purple-1" : "text-purple-1"}`}
                        style={{ display: "none", wordBreak: "break-all" }}
                      >
                        {homepageData.features.imageUrl}
                      </div>
                    </a>
                  ) : (
                    <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>N/A</div>
                  )}
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Feature List
                  </div>
                  <div className="row y-gap-10">
                    {homepageData.features?.featureList?.map((feature, index) => (
                      <div key={feature._id || index} className="col-12">
                        <div className={`px-15 py-10 rounded-8 ${isDarkMode ? "bg-dark-2" : "bg-light-3"}`}>
                          <span className={`text-14 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                            {feature.text || "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Section */}
          <div className="col-12">
            <div
              className="rounded-16 p-30 px-20 py-20"
              style={{
                backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
              }}
            >
              <div className="d-flex justify-between items-center mb-20">
                <h2 className={`text-20 fw-600 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Process
                </h2>
                <button
                  onClick={() => handleEdit("process")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="row y-gap-20">
                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Heading
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.process?.heading || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Subtitle
                  </div>
                  <div className={`text-16 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                    {homepageData.process?.subtitle || "N/A"}
                  </div>
                </div>

                <div className="col-12">
                  <div className={`text-14 fw-500 mb-5 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                    Steps
                  </div>
                  <div className="row y-gap-15">
                    {homepageData.process?.steps?.map((step, index) => (
                      <div key={step._id || index} className="col-12">
                        <div className={`px-20 py-15 rounded-8 ${isDarkMode ? "bg-dark-2" : "bg-light-3"}`}>
                          <div className={`text-16 fw-600 mb-5 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                            {step.stepNumber} - {step.title}
                          </div>
                          <div className={`text-14 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                            {step.description || "N/A"}
                          </div>
                          <div className={`text-12 mt-5 ${isDarkMode ? "text-gray-4" : "text-dark-4"}`}>
                            Order: {step.order || "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="col-12">
            <div
              className="rounded-16 p-30 px-20 py-20"
              style={{
                backgroundColor: isDarkMode ? "#140342" : "#ffffff",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #DDDDDD",
              }}
            >
              <div className="d-flex justify-between items-center mb-20">
                <h2 className={`text-20 fw-600 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                  Statistics
                </h2>
                <button
                  onClick={() => handleEdit("statistics")}
                  className="button -md -outline-purple-1 text-purple-1"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="row y-gap-15">
                {homepageData.statistics?.map((stat, index) => (
                  <div key={stat._id || index} className="col-lg-3 col-md-6 col-12">
                    <div className={`px-20 py-15 rounded-8 text-center ${isDarkMode ? "bg-dark-2" : "bg-light-3"}`}>
                      <div className={`text-24 fw-700 mb-5 ${isDarkMode ? "text-white" : "text-dark-1"}`}>
                        {stat.number || "N/A"}
                      </div>
                      <div className={`text-14 ${isDarkMode ? "text-gray-3" : "text-dark-3"}`}>
                        {stat.label || "N/A"}
                      </div>
                      <div className={`text-12 mt-5 ${isDarkMode ? "text-gray-4" : "text-dark-4"}`}>
                        Order: {stat.order || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomepageContentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        section={editingSection}
        sectionData={homepageData}
        homepageId={homepageData?._id}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
