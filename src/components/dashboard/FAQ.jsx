import React, { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import FAQFormModal from "./FAQFormModal";

export default function FAQ() {
  const { auth } = useContextElement();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);

  const fetchFAQs = useCallback(async () => {
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

      const response = await fetch(getApiUrl("contact/admin/faq"), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch FAQs: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        // Sort by order
        const sortedFAQs = result.data.sort((a, b) => {
          return (a.order || 0) - (b.order || 0);
        });
        setFaqs(sortedFAQs);
      } else {
        throw new Error(result.message || "Failed to fetch FAQs");
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError(err.message);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setIsModalOpen(true);
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFAQ(null);
  };

  const handleModalSuccess = () => {
    fetchFAQs();
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10 justify-between items-center">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">FAQ Management</h1>
            <div className="mt-10">
              Manage frequently asked questions and their answers.
            </div>
          </div>
          <div className="col-auto">
            <button
              onClick={handleAddFAQ}
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
              Add FAQ
            </button>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">Frequently Asked Questions</h2>
              </div>

              <div className="py-30 px-30">
                <style>
                  {`
                    @media (max-width: 768px) {
                      .faq-item-container {
                        flex-direction: column !important;
                      }
                      .faq-item-content {
                        padding-right: 0 !important;
                        width: 100% !important;
                      }
                      .faq-edit-button {
                        position: relative !important;
                        top: auto !important;
                        right: auto !important;
                        margin-top: 15px !important;
                        align-self: flex-end !important;
                      }
                    }
                  `}
                </style>
                {loading && (
                  <div className="text-center py-50">
                    <div className="text-16 text-dark-1 -dark-text-white">Loading FAQs...</div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-50">
                    <div className="text-16 text-red-1">Error: {error}</div>
                  </div>
                )}

                {!loading && !error && faqs.length > 0 ? (
                  <div className="row y-gap-30">
                    {faqs.map((faq, i) => (
                      <div key={faq._id} className="col-12">
                        <div
                          className={`d-flex faq-item-container ${
                            i !== 0 ? "border-top-light pt-30" : "pt-0"
                          } relative`}
                          style={{ position: "relative" }}
                        >
                          <div className="flex-1 faq-item-content" style={{ paddingRight: "50px" }}>
                            <div className="d-flex items-center mb-15 faq-item-header" style={{ flexWrap: "wrap", gap: "10px" }}>
                              <div className="d-flex items-center" style={{ flexWrap: "wrap", gap: "10px" }}>
                                <h4 className="text-17 fw-500 lh-15 text-dark-1 -dark-text-white faq-item-question">
                                  {faq.question}
                                </h4>
                                <div className="d-flex items-center faq-item-badges" style={{ gap: "10px" }}>
                                  <div>
                                    {faq.isActive !== false ? (
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
                                  <div>
                                    <span
                                      className="px-10 py-5 rounded-200"
                                      style={{
                                        backgroundColor: "#e0e7ff",
                                        color: "#3730a3",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      Order: {faq.order}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="text-15 lh-1 text-dark-1 -dark-text-white">
                              <p>{faq.answer}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleEditFAQ(faq)}
                            className="button -sm d-flex items-center justify-center faq-edit-button"
                            style={{
                              position: "absolute",
                              top: i !== 0 ? "30px" : "0",
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
                    ))}
                  </div>
                ) : !loading && !error ? (
                  <div className="text-center py-50">
                    <div className="text-16 text-dark-1 -dark-text-white">
                      No FAQs found
                    </div>
                  </div>
                ) : null}
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

      <FAQFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        faq={editingFAQ}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
