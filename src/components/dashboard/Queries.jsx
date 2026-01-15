import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import ResolveQueryModal from "./ResolveQueryModal";

export default function Queries() {
  const { auth } = useContextElement();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const fetchQueries = useCallback(async () => {
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

      const response = await fetch(getApiUrl("contact/admin"), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch queries: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        // Sort by createdAt (newest first)
        const sortedQueries = result.data.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });
        setQueries(sortedQueries);
      } else {
        throw new Error(result.message || "Failed to fetch queries");
      }
    } catch (err) {
      console.error("Error fetching queries:", err);
      setError(err.message);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResolveQuery = (query) => {
    setSelectedQuery(query);
    setIsResolveModalOpen(true);
  };

  const handleResolveModalClose = () => {
    setIsResolveModalOpen(false);
    setSelectedQuery(null);
  };

  const handleResolveSuccess = () => {
    fetchQueries();
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">Queries</h1>
            <div className="mt-10">
              Manage and view all contact queries from users.
            </div>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">All Queries</h2>
              </div>

              <div className="py-30 px-30">
                <style>
                  {`
                    @media (max-width: 768px) {
                      .query-item-container {
                        flex-direction: column !important;
                      }
                      .query-avatar {
                        margin-right: 0 !important;
                        margin-bottom: 15px !important;
                      }
                      .query-content {
                        width: 100% !important;
                        padding-right: 0 !important;
                      }
                      .query-header-row {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 10px !important;
                      }
                      .query-name-email {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        width: 100% !important;
                      }
                      .query-name-email span {
                        margin-left: 0 !important;
                        margin-top: 5px !important;
                      }
                      .query-actions {
                        position: relative !important;
                        top: auto !important;
                        right: auto !important;
                        margin-top: 15px !important;
                        width: 100% !important;
                        justify-content: flex-start !important;
                      }
                      .query-meta-info {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 5px !important;
                      }
                    }
                  `}
                </style>
                {loading && (
                  <div className="text-center py-50">
                    <div className="text-16 text-dark-1 -dark-text-white">Loading queries...</div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-50">
                    <div className="text-16 text-red-1">Error: {error}</div>
                  </div>
                )}

                {!loading && !error && (
                  <div className="row y-gap-30">
                    {queries.length > 0 ? (
                      queries.map((query, i) => (
                        <div key={query._id || i} className="col-12">
                          <div
                            className={`d-flex query-item-container ${
                              i != 0 ? "border-top-light" : ""
                            } pt-30 relative`}
                            style={{ position: "relative" }}
                          >
                            <div className="mr-20 query-avatar">
                              <div
                                className="size-60 rounded-full bg-purple-1 d-flex items-center justify-center"
                                style={{
                                  fontSize: "24px",
                                  fontWeight: "600",
                                  color: "white",
                                }}
                              >
                                {query.name
                                  ? query.name.charAt(0).toUpperCase()
                                  : "?"}
                              </div>
                            </div>

                            <div className="comments__body query-content flex-1" style={{ paddingRight: "120px" }}>
                              <div className="comments__header">
                                <div className="d-flex items-center query-header-row" style={{ flexWrap: "wrap", gap: "10px" }}>
                                  <h4 className="text-17 fw-500 lh-15 d-flex items-center query-name-email" style={{ flexWrap: "wrap" }}>
                                    {query.name || "Anonymous"}
                                    <span className="text-13 text-light-1 fw-400 ml-5" style={{ display: "block", width: "100%" }}>
                                      {query.email || ""}
                                      {query.phone ? ` • ${query.phone}` : ""}
                                    </span>
                                  </h4>
                                  <div>
                                    {query.isResolved ? (
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
                                        Resolved
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
                                        Unresolved
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-10 d-flex items-center x-gap-10 query-meta-info" style={{ flexWrap: "wrap" }}>
                                  {query.source && (
                                    <span className="text-13 text-light-1 -dark-text-white">
                                      Source: {query.source}
                                    </span>
                                  )}
                                  {query.createdAt && (
                                    <span className="text-13 text-light-1 -dark-text-white">
                                      • {formatDate(query.createdAt)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-15">
                                <span className="text-13 text-light-1 -dark-text-white fw-500">Subject: </span>
                                <h5 className="text-15 fw-500 d-inline text-dark-1 -dark-text-white">
                                  {query.subject || "No Subject"}
                                </h5>
                              </div>
                              <div className="comments__text mt-10 text-dark-1 -dark-text-white">
                                <p>{query.message || "No message"}</p>
                              </div>

                              {/* Show notes if resolved */}
                              {query.isResolved && query.notes && (
                                <>
                                  <div className="border-top-light mt-20 pt-20">
                                    <div className="text-13 text-light-1 -dark-text-white fw-500 mb-10">
                                      Resolution Notes:
                                    </div>
                                    <div className="text-14 text-dark-1 -dark-text-white">
                                      {query.notes}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <div
                              className="query-actions"
                              style={{
                                position: "absolute",
                                top: "30px",
                                right: "0",
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                              }}
                            >
                              {!query.isResolved && (
                                <button
                                  onClick={() => handleResolveQuery(query)}
                                  className="button text-13 -sm -light-7 -dark-button-dark-2 text-purple-1"
                                  style={{
                                    whiteSpace: "nowrap",
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                  }}
                                >
                                  Resolve
                                </button>
                              )}
                              <a
                                href={`mailto:${query.email || ""}`}
                                className="button text-13 -sm -light-7 -dark-button-dark-2 text-purple-1"
                                style={{
                                  textDecoration: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Respond
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-50">
                        <div className="text-16 text-dark-1 -dark-text-white">
                          No queries found
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

      <ResolveQueryModal
        isOpen={isResolveModalOpen}
        onClose={handleResolveModalClose}
        query={selectedQuery}
        onSuccess={handleResolveSuccess}
      />
    </div>
  );
}

