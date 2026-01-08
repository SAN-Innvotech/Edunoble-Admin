import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import TestimonialFormModal from "./TestimonialFormModal";

export default function Testimonials() {
  const { auth } = useContextElement();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization token if available
      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl("testimonials/admin/list"), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        // Filter out deleted testimonials and sort by order
        const allTestimonials = result.data
          .filter((item) => item.isDeleted !== true)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setTestimonials(allTestimonials);
      } else {
        throw new Error(result.message || "Failed to fetch testimonials");
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError(err.message);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleAddTestimonial = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
  };

  const handleModalSuccess = () => {
    fetchTestimonials();
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10 justify-between items-center">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">Testimonials</h1>
            <div className="mt-10">
              Manage and view all testimonials from students.
            </div>
          </div>
          <div className="col-auto">
            <button
              onClick={handleAddTestimonial}
              className="button -md -purple-1 text-white"
              style={{
                border: "1px solid #6366f1",
                background: "#6366f1",
                color: "white",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Add Testimonial
            </button>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">All Testimonials</h2>
              </div>

              <div className="py-30 px-30">
                {loading && (
                  <div className="text-center py-50">
                    <div className="text-16 text-dark-1">Loading testimonials...</div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-50">
                    <div className="text-16 text-red-1">Error: {error}</div>
                  </div>
                )}

                {!loading && !error && (
                  <div className="row y-gap-30">
                    {testimonials.length > 0 ? (
                      testimonials.map((testimonial, i) => (
                        <div key={testimonial._id || i} className="md:direction-column">
                          <div
                            className={`d-flex ${
                              i != 0 ? "border-top-light" : ""
                            }  pt-30 relative`}
                            style={{ position: "relative" }}
                          >
                            <div className="mr-20">
                              <div
                                className="size-60 rounded-full bg-purple-1 d-flex items-center justify-center"
                                style={{
                                  fontSize: "24px",
                                  fontWeight: "600",
                                  color: "white",
                                }}
                              >
                                {testimonial.authorName
                                  ? testimonial.authorName.charAt(0).toUpperCase()
                                  : "?"}
                              </div>
                            </div>

                            <div className="comments__body md:mt-15 flex-1">
                              <div className="comments__header">
                                <div className="d-flex items-center">
                                  <h4 className="text-17 fw-500 lh-15 d-flex items-center">
                                    {testimonial.authorName || "Anonymous"}
                                    <span className="text-13 text-light-1 fw-400 ml-5">
                                      {testimonial.authorClass || ""}
                                      {testimonial.authorDetails
                                        ? ` • ${testimonial.authorDetails}`
                                        : ""}
                                    </span>
                                  </h4>
                                  <div className="ml-10">
                                    {testimonial.isActive !== false ? (
                                      <span
                                        className="d-flex items-center px-10 py-5 rounded-200"
                                        style={{
                                          backgroundColor: "#d1fae5",
                                          color: "#065f46",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                          gap: "6px",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <span
                                          style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            backgroundColor: "#10b981",
                                            display: "inline-block",
                                          }}
                                        ></span>
                                        Active
                                      </span>
                                    ) : (
                                      <span
                                        className="d-flex items-center px-10 py-5 rounded-200"
                                        style={{
                                          backgroundColor: "#fee2e2",
                                          color: "#991b1b",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                          gap: "6px",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <span
                                          style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            backgroundColor: "#ef4444",
                                            display: "inline-block",
                                          }}
                                        ></span>
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <h5 className="text-15 fw-500 mt-15">
                                {testimonial.heading}
                              </h5>
                              <div className="comments__text mt-10">
                                <p>{testimonial.quote}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleEditTestimonial(testimonial)}
                              className="button -sm d-flex items-center justify-center"
                              style={{
                                position: "absolute",
                                top: "30px",
                                right: "0",
                                border: "1px solid #6366f1",
                                background: "white",
                                color: "#6366f1",
                                borderRadius: "8px",
                                padding: "8px",
                                width: "36px",
                                height: "36px",
                                cursor: "pointer",
                                zIndex: 10,
                                transition: "all 0.3s ease",
                              }}
                           
                            >
                              <i className="icon-edit text-16"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-50">
                        <div className="text-16 text-dark-1">
                          No testimonials found
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer -dashboard py-30">
        <div className="row items-center justify-between">
          <div className="col-auto">
            <div className="text-13 lh-1">
              © 2026 Edunoble. All Right Reserved.
            </div>
          </div>
        </div>
      </footer>

      <TestimonialFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        testimonial={editingTestimonial}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

