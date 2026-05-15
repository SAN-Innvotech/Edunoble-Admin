import React, { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import TopperFormModal from "./TopperFormModal";
import Toast from "../common/Toast";

export default function Toppers() {
  const { auth } = useContextElement();
  const [toppers, setToppers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopper, setEditingTopper] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const fetchToppers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl("toppers/admin/list"), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch toppers: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        const allToppers = result.data
          .filter((item) => item.isDeleted !== true)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setToppers(allToppers);
      } else {
        throw new Error(result.message || "Failed to fetch toppers");
      }
    } catch (err) {
      console.error("Error fetching toppers:", err);
      setError(err.message);
      setToppers([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchToppers();
  }, [fetchToppers]);

  const handleAddTopper = () => {
    setEditingTopper(null);
    setIsModalOpen(true);
  };

  const handleEditTopper = (topper) => {
    setEditingTopper(topper);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTopper(null);
  };

  const handleModalSuccess = () => {
    fetchToppers();
  };

  const handleDeleteTopper = async (topper) => {
    const topperId = topper._id || topper.id;
    if (!topperId) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${topper.studentName || "this topper"}"?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(topperId);

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl(`toppers/admin/${topperId}`), {
        method: "DELETE",
        headers,
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to delete topper");
      }

      setToast({
        isVisible: true,
        message: result.message || "Topper deleted successfully",
        type: "success",
      });

      fetchToppers();
    } catch (err) {
      setToast({
        isVisible: true,
        message: err.message || "An error occurred while deleting the topper",
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10 justify-between items-center">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">Toppers</h1>
            <div className="mt-10">Manage and showcase student achievers.</div>
          </div>
          <div className="col-auto">
            <button
              onClick={handleAddTopper}
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
              Add Topper
            </button>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">All Toppers</h2>
              </div>

              <div className="py-30 px-30">
                <style>
                  {`
                    @media (max-width: 768px) {
                      .topper-item-container {
                        flex-direction: column !important;
                      }
                      .topper-avatar {
                        margin-right: 0 !important;
                        margin-bottom: 15px !important;
                      }
                      .topper-content {
                        width: 100% !important;
                        padding-right: 0 !important;
                      }
                      .topper-action-buttons {
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
                    <div className="text-16 text-dark-1 -dark-text-white">
                      Loading toppers...
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-50">
                    <div className="text-16 text-red-1">Error: {error}</div>
                  </div>
                )}

                {!loading && !error && (
                  <div className="row y-gap-30">
                    {toppers.length > 0 ? (
                      toppers.map((topper, i) => (
                        <div key={topper._id || i} className="col-12">
                          <div
                            className={`d-flex topper-item-container ${
                              i !== 0 ? "border-top-light pt-30" : "pt-0"
                            } relative`}
                            style={{ position: "relative" }}
                          >
                            <div className="mr-20 topper-avatar">
                              {topper.photo ? (
                                <img
                                  src={topper.photo}
                                  alt={topper.studentName}
                                  className="size-60 rounded-full"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="size-60 rounded-full bg-purple-1 d-flex items-center justify-center"
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: "600",
                                    color: "white",
                                  }}
                                >
                                  {topper.studentName
                                    ? topper.studentName.charAt(0).toUpperCase()
                                    : "?"}
                                </div>
                              )}
                            </div>

                            <div
                              className="flex-1 topper-content"
                              style={{ paddingRight: "100px" }}
                            >
                              <div
                                className="d-flex items-center mb-10"
                                style={{ flexWrap: "wrap", gap: "10px" }}
                              >
                                <h4 className="text-17 fw-500 lh-15 text-dark-1 -dark-text-white">
                                  {topper.studentName || "Anonymous"}
                                  <span className="text-13 text-light-1 -dark-text-white fw-400 ml-5">
                                    {topper.classLevel || ""}
                                    {topper.board ? ` • ${topper.board}` : ""}
                                  </span>
                                </h4>
                                <div>
                                  {topper.isActive !== false ? (
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
                                {topper.score && (
                                  <div>
                                    <span
                                      className="px-10 py-5 rounded-200"
                                      style={{
                                        backgroundColor: "#e0e7ff",
                                        color: "#3730a3",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {topper.score}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {(topper.examName || topper.year) && (
                                <h5 className="text-15 fw-500 text-dark-1 -dark-text-white">
                                  {topper.examName || ""}
                                  {topper.examName && topper.year ? " — " : ""}
                                  {topper.year || ""}
                                </h5>
                              )}
                              {topper.achievement && (
                                <div className="text-14 text-dark-1 -dark-text-white mt-5">
                                  {topper.achievement}
                                </div>
                              )}
                              {topper.quote && (
                                <div className="comments__text mt-10 text-dark-1 -dark-text-white">
                                  <p>{topper.quote}</p>
                                </div>
                              )}
                              <div className="text-13 text-light-1 mt-10">
                                Order: {topper.order ?? 0}
                              </div>
                            </div>

                            <div
                              className="topper-action-buttons d-flex"
                              style={{
                                position: "absolute",
                                top: i !== 0 ? "30px" : "0",
                                right: "0",
                                gap: "8px",
                                zIndex: 10,
                              }}
                            >
                              <button
                                onClick={() => handleEditTopper(topper)}
                                className="button -sm d-flex items-center justify-center"
                                title="Edit"
                                style={{
                                  border: "1px solid #6366f1",
                                  background: "white",
                                  color: "#6366f1",
                                  borderRadius: "8px",
                                  padding: "8px",
                                  width: "36px",
                                  height: "36px",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <i className="icon-edit text-16"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteTopper(topper)}
                                disabled={deletingId === (topper._id || topper.id)}
                                className="button -sm d-flex items-center justify-center"
                                title="Delete"
                                style={{
                                  border: "1px solid #ef4444",
                                  background: "white",
                                  color: "#ef4444",
                                  borderRadius: "8px",
                                  padding: "8px",
                                  width: "36px",
                                  height: "36px",
                                  cursor:
                                    deletingId === (topper._id || topper.id)
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    deletingId === (topper._id || topper.id) ? 0.5 : 1,
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <i className="icon-bin text-16"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-50">
                        <div className="text-16 text-dark-1 -dark-text-white">
                          No toppers found
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

      <TopperFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        topper={editingTopper}
        onSuccess={handleModalSuccess}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
