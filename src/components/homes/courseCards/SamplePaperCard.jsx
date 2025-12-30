import React, { useState } from "react";
import { Chip } from "@mui/material";
import SecureDocumentViewer from "../../common/SecureDocumentViewer";
import { createPortal } from "react-dom";

export default function SamplePaperCard({ paper, onEdit }) {
  const [showViewer, setShowViewer] = useState(false);

  const handleViewPaper = (e) => {
    e.preventDefault();
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
  };

  return (
    <>
      <style>
        {`
          .samplePaperCard .view-paper-btn:hover {
            background: #6366f1 !important;
            color: white !important;
          }
        `}
      </style>
      <div className="col-lg-3 col-md-6">
        <div>
          <div className="coursesCard -type-1 bg-white samplePaperCard">
            <div className="relative">
              <div className="coursesCard__image overflow-hidden rounded-8 d-flex align-items-center justify-center bg-light-4">
                <div className="w-1/1 d-flex items-center justify-center py-40">
                  <div className="size-60 rounded-full bg-purple-1 d-flex items-center justify-center">
                    <span className="text-white fw-600 text-16">DOC</span>
                  </div>
                </div>
                <div className="coursesCard__image_overlay rounded-8"></div>
              </div>
            </div>

            <div className="h-100 pt-15">
              <div className="text-15 lh-1 text-dark-1 mb-5 d-flex items-center">
                <span>
                  Class {paper.class} • {paper.subject}
                </span>
                <span className="ml-10">
                  {paper.isActive !== false ? (
                    <span
                      className="d-flex items-center px-8 py-3 rounded-200"
                      style={{
                        backgroundColor: "#d1fae5",
                        color: "#065f46",
                        fontSize: "9px",
                        fontWeight: "500",
                        gap: "4px",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#10b981",
                          display: "inline-block",
                        }}
                      ></span>
                      Active
                    </span>
                  ) : (
                    <span
                      className="d-flex items-center px-8 py-3 rounded-200"
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        fontSize: "9px",
                        fontWeight: "500",
                        gap: "4px",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#ef4444",
                          display: "inline-block",
                        }}
                      ></span>
                      Inactive
                    </span>
                  )}
                </span>
              </div>

              <div className="text-17 lh-15 fw-500 text-dark-1 mt-5">
                {paper.title}
              </div>

              <div className="mt-10 text-13 text-light-1">
                {paper.board && <span>{paper.board}</span>}
                {paper.board && paper.examType && <span> • </span>}
                {paper.examType && <span>{paper.examType}</span>}
                {(paper.board || paper.examType) && <span> • </span>}
                <span>{paper.year}</span>
              </div>

              {paper.description && (
                <div
                  className="mt-10 text-13 text-light-1"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                  }}
                >
                  {paper.description}
                </div>
              )}

              {paper.tags && paper.tags.length > 0 && (
                <div className="mt-10 d-flex flex-wrap x-gap-5 y-gap-5">
                  {paper.tags.slice(0, 3).map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      sx={{
                        fontSize: "11px",
                        borderRadius: "999px",
                        marginRight: "5px",
                        bgcolor: "rgba(148, 163, 184, 0.12)",
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="mt-15 d-flex">
                <button
                  onClick={handleViewPaper}
                  className="button -sm -outline-purple-1 text-purple-1 text-center view-paper-btn"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    width: "66.666%",
                    borderRight: "none",
                    borderTopRightRadius: "0",
                    borderBottomRightRadius: "0",
                  }}
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onEdit) {
                      onEdit(paper);
                    }
                  }}
                  className="button -sm -dark-1 text-purple-1 d-flex items-center justify-center"
                  style={{
                    border: "1px solid #6366f1",
                    background: "transparent",
                    color: "#6366f1",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    width: "33.334%",
                    borderTopLeftRadius: "0",
                    borderBottomLeftRadius: "0",
                  }}
                  // onMouseEnter={(e) => {
                  //   e.target.style.background = "#6366f1";
                  //   e.target.style.color = "white";
                  // }}
                  // onMouseLeave={(e) => {
                  //   e.target.style.background = "transparent";
                  //   e.target.style.color = "#6366f1";
                  // }}
                >
                  <i className="icon-edit text-16"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showViewer &&
        createPortal(
          <SecureDocumentViewer
            fileUrl={paper.fileUrl}
            onClose={handleCloseViewer}
            title={paper.title}
          />,
          document.body
        )}
    </>
  );
}


