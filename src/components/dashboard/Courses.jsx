import React, { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import CourseFormModal from "./CourseFormModal";
import Toast from "../common/Toast";

export default function Courses() {
  const { auth } = useContextElement();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl("courses/admin/list"), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        const allCourses = result.data
          .filter((item) => item.isDeleted !== true)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setCourses(allCourses);
      } else {
        throw new Error(result.message || "Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleModalSuccess = () => {
    fetchCourses();
  };

  const handleDeleteCourse = async (course) => {
    const courseId = course._id || course.id;
    if (!courseId) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${course.name || "this course"}"?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(courseId);

      const headers = {
        "Content-Type": "application/json",
      };

      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl(`courses/admin/${courseId}`), {
        method: "DELETE",
        headers,
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to delete course");
      }

      setToast({
        isVisible: true,
        message: result.message || "Course deleted successfully",
        type: "success",
      });

      fetchCourses();
    } catch (err) {
      setToast({
        isVisible: true,
        message: err.message || "An error occurred while deleting the course",
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
            <h1 className="text-30 lh-12 fw-700">Courses</h1>
            <div className="mt-10">Manage courses offered by Edunoble.</div>
          </div>
          <div className="col-auto">
            <button
              onClick={handleAddCourse}
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
              Add Course
            </button>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">All Courses</h2>
              </div>

              <div className="py-30 px-30">
                <style>
                  {`
                    @media (max-width: 768px) {
                      .course-item-container {
                        flex-direction: column !important;
                      }
                      .course-item-thumb {
                        margin-right: 0 !important;
                        margin-bottom: 15px !important;
                      }
                      .course-item-content {
                        width: 100% !important;
                        padding-right: 0 !important;
                      }
                      .course-action-buttons {
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
                      Loading courses...
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
                    {courses.length > 0 ? (
                      courses.map((course, i) => (
                        <div key={course._id || i} className="col-12">
                          <div
                            className={`d-flex course-item-container ${
                              i !== 0 ? "border-top-light pt-30" : "pt-0"
                            } relative`}
                            style={{ position: "relative" }}
                          >
                            <div className="mr-20 course-item-thumb">
                              {course.coverImage ? (
                                <img
                                  src={course.coverImage}
                                  alt={course.name}
                                  style={{
                                    width: "90px",
                                    height: "70px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="bg-purple-1 d-flex items-center justify-center"
                                  style={{
                                    width: "90px",
                                    height: "70px",
                                    borderRadius: "8px",
                                    fontSize: "24px",
                                    fontWeight: "600",
                                    color: "white",
                                  }}
                                >
                                  {course.name
                                    ? course.name.charAt(0).toUpperCase()
                                    : "?"}
                                </div>
                              )}
                            </div>

                            <div
                              className="flex-1 course-item-content"
                              style={{ paddingRight: "100px" }}
                            >
                              <div
                                className="d-flex items-center mb-10"
                                style={{ flexWrap: "wrap", gap: "10px" }}
                              >
                                <h4 className="text-17 fw-500 lh-15 text-dark-1 -dark-text-white">
                                  {course.name || "Untitled"}
                                </h4>
                                <div>
                                  {course.isActive !== false ? (
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
                                {course.mode && (
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
                                      {course.mode}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {course.description && (
                                <div className="comments__text text-dark-1 -dark-text-white">
                                  <p>{course.description}</p>
                                </div>
                              )}
                              <div
                                className="text-13 text-light-1 mt-10"
                                style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
                              >
                                {course.subject && <span>{course.subject}</span>}
                                {course.classLevel && <span>{course.classLevel}</span>}
                                {course.duration && <span>{course.duration}</span>}
                                {course.feeRange && <span>{course.feeRange}</span>}
                                <span>Order: {course.order ?? 0}</span>
                              </div>
                            </div>

                            <div
                              className="course-action-buttons d-flex"
                              style={{
                                position: "absolute",
                                top: i !== 0 ? "30px" : "0",
                                right: "0",
                                gap: "8px",
                                zIndex: 10,
                              }}
                            >
                              <button
                                onClick={() => handleEditCourse(course)}
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
                                onClick={() => handleDeleteCourse(course)}
                                disabled={deletingId === (course._id || course.id)}
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
                                    deletingId === (course._id || course.id)
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    deletingId === (course._id || course.id) ? 0.5 : 1,
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
                          No courses found
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

      <CourseFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        course={editingCourse}
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
