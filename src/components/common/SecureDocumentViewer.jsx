import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { renderAsync } from "docx-preview";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function SecureDocumentViewer({ fileUrl, onClose, title }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fileType, setFileType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useIframe, setUseIframe] = useState(false);
  const [processedUrl, setProcessedUrl] = useState(null);
  const containerRef = useRef(null);
  const docxContainerRef = useRef(null);

  useEffect(() => {
    // Prevent screenshots and downloads
    const preventScreenshot = (e) => {
      // Disable right-click
      e.preventDefault();
      return false;
    };

    const preventKeys = (e) => {
      // Disable Print Screen, F12, Ctrl+P, Ctrl+S, Ctrl+A, Windows+Shift+S
      if (
        e.key === "PrintScreen" ||
        e.key === "F12" ||
        (e.ctrlKey && (e.key === "p" || e.key === "P" || e.key === "s" || e.key === "S" || e.key === "a" || e.key === "A" || e.key === "c" || e.key === "C")) ||
        (e.metaKey && (e.key === "p" || e.key === "P" || e.key === "s" || e.key === "S")) ||
        (e.metaKey && e.shiftKey && (e.key === "4" || e.key === "3")) || // Mac screenshot shortcuts
        (e.key === "F12") ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "C" || e.key === "c" || e.key === "J" || e.key === "j"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventDevTools = (e) => {
      // Prevent opening DevTools
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "C" || e.key === "c" || e.key === "J" || e.key === "j"))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Detect screen capture attempts
    const detectScreenCapture = () => {
      // Blur the window when user tries to switch (common before screenshots)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // User switched tabs/windows - might be taking screenshot
          document.body.style.filter = "blur(10px)";
          setTimeout(() => {
            document.body.style.filter = "none";
          }, 1000);
        }
      };

      // Detect window resize (some screenshot tools trigger this)
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Suspicious activity
        }, 100);
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("resize", handleResize);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("resize", handleResize);
      };
    };

    // Add event listeners
    document.addEventListener("contextmenu", preventScreenshot);
    document.addEventListener("keydown", preventKeys, true); // Use capture phase
    document.addEventListener("keydown", preventDevTools, true);
    document.addEventListener("selectstart", (e) => e.preventDefault());
    document.addEventListener("copy", (e) => e.preventDefault());
    document.addEventListener("cut", (e) => e.preventDefault());
    document.addEventListener("paste", (e) => e.preventDefault());
    document.addEventListener("dragstart", (e) => e.preventDefault());

    const cleanupScreenCapture = detectScreenCapture();

    // Detect file type and convert Google Drive link if needed
    const processFileUrl = async () => {
      try {
        let processedUrl = fileUrl;
        let detectedType = null;
        
        // Convert Google Drive link to direct view link
        if (fileUrl.includes("docs.google.com")) {
          // For Google Docs
          if (fileUrl.includes("/document/")) {
            const docId = fileUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
            if (docId) {
              // Convert to export format (PDF) - this is the most reliable way
              processedUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
              detectedType = "pdf";
              setFileType("pdf");
              setLoading(false);
              return; // PDF will be loaded by react-pdf
            }
          }
        } else if (fileUrl.includes("drive.google.com")) {
          // Extract file ID from various Google Drive URL formats
          const fileIdMatch = fileUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) ||
                            fileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/) ||
                            fileUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
          const fileId = fileIdMatch?.[1];
          
          if (fileId) {
            // For Google Drive files, use Google Docs Viewer or direct download
            // Try direct download first (works for publicly shared files)
            processedUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            detectedType = "pdf";
            setFileType("pdf");
            setLoading(false);
            return;
          }
        } else {
          // Detect file type from URL
          const urlLower = fileUrl.toLowerCase();
          if (urlLower.endsWith(".pdf")) {
            detectedType = "pdf";
          } else if (urlLower.endsWith(".docx") || urlLower.endsWith(".doc")) {
            detectedType = "docx";
          } else {
            // Default to PDF
            detectedType = "pdf";
          }
        }

        setFileType(detectedType || "pdf");
        
        // Load document based on type
        if (detectedType === "docx") {
          await loadDocx(processedUrl);
        } else {
          // PDF will be loaded by react-pdf Document component
          setLoading(false);
        }
      } catch (err) {
        console.error("Error processing file:", err);
        setError("Failed to load document. Please try again.");
        setLoading(false);
      }
    };

    processFileUrl();

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", preventScreenshot);
      document.removeEventListener("keydown", preventKeys, true);
      document.removeEventListener("keydown", preventDevTools, true);
      document.removeEventListener("selectstart", (e) => e.preventDefault());
      document.removeEventListener("copy", (e) => e.preventDefault());
      document.removeEventListener("cut", (e) => e.preventDefault());
      document.removeEventListener("paste", (e) => e.preventDefault());
      document.removeEventListener("dragstart", (e) => e.preventDefault());
      if (cleanupScreenCapture) cleanupScreenCapture();
    };
  }, [fileUrl, fileType]);

  const loadDocx = async (url) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      if (docxContainerRef.current) {
        await renderAsync(arrayBuffer, docxContainerRef.current, null, {
          className: "docx-wrapper",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
        });
      }
    } catch (err) {
      console.error("Error loading DOCX:", err);
      setError("Failed to load DOCX document.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
    
    // If it's a Google Drive file and direct load fails, try iframe viewer
    if (fileUrl.includes("drive.google.com") || fileUrl.includes("docs.google.com")) {
      const fileId = fileUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] ||
                   fileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ||
                   fileUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/)?.[1] ||
                   fileUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      
      if (fileId) {
        // Use Google Docs Viewer as fallback
        if (fileUrl.includes("docs.google.com")) {
          setProcessedUrl(`https://docs.google.com/document/d/${fileId}/preview`);
        } else {
          setProcessedUrl(`https://drive.google.com/file/d/${fileId}/preview`);
        }
        setUseIframe(true);
        setLoading(false);
        return;
      }
    }
    
    setError("Failed to load PDF document. Please ensure the file is publicly accessible.");
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  return (
    <div
      className="secure-document-viewer-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px 20px",
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>
          {title || "Sample Paper Viewer"}
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "0 10px",
          }}
        >
          ×
        </button>
      </div>

      {/* Document Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: fileType === "pdf" ? "flex-start" : "center",
          padding: "20px",
          position: "relative",
        }}
      >
        {/* Watermark Overlay - Makes screenshots less useful */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 1000,
            background: "repeating-linear-gradient(45deg, transparent, transparent 200px, rgba(255, 0, 0, 0.01) 200px, rgba(255, 0, 0, 0.01) 400px)",
            mixBlendMode: "multiply",
          }}
        />
        
        {/* User-specific watermark text overlay */}
        {/* <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            fontSize: "48px",
            color: "rgba(255, 0, 0, 0.1)",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 1001,
            whiteSpace: "nowrap",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          Edunoble - Protected
        </div> */}
        
        {/* Additional watermark pattern */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            fontSize: "24px",
            color: "rgba(255, 0, 0, 0.08)",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 1001,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          Edunoble Sample Paper
        </div>
        
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            fontSize: "24px",
            color: "rgba(255, 0, 0, 0.08)",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 1001,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {new Date().toLocaleDateString()} - View Only
        </div>
        {loading && (
          <div style={{ color: "#fff", fontSize: "18px" }}>Loading document...</div>
        )}

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: "18px", textAlign: "center" }}>
            {error}
          </div>
        )}

        {!loading && !error && fileType === "pdf" && !useIframe && (
          <>
            <Document
              file={
                fileUrl.includes("docs.google.com")
                  ? fileUrl.includes("/export?format=pdf")
                    ? fileUrl
                    : (() => {
                        const docId = fileUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
                        return docId ? `https://docs.google.com/document/d/${docId}/export?format=pdf` : fileUrl;
                      })()
                  : fileUrl.includes("drive.google.com")
                  ? fileUrl.includes("export=download") || fileUrl.includes("uc?")
                    ? fileUrl
                    : (() => {
                        // Extract file ID from various Google Drive URL formats
                        const fileId = fileUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] ||
                                     fileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ||
                                     fileUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/)?.[1];
                        return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : fileUrl;
                      })()
                  : fileUrl
              }
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div style={{ color: "#fff" }}>Loading PDF...</div>}
              options={{
                cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
                httpHeaders: {},
              }}
            >
              <div style={{ position: "relative", zIndex: 1 }}>
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  width={Math.min(1200, window.innerWidth - 100)}
                  style={{
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                    backgroundColor: "#fff",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
                {/* Additional protection overlay on PDF */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: "none",
                    background: "transparent",
                    zIndex: 2,
                  }}
                />
              </div>
            </Document>
          </>
        )}

        {!loading && !error && useIframe && processedUrl && (
          <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 1 }}>
            <iframe
              src={processedUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                backgroundColor: "#fff",
                position: "relative",
                zIndex: 1,
              }}
              title="Document Viewer"
              onLoad={() => setLoading(false)}
              onError={() => {
                setError("Failed to load document. Please ensure the file is publicly shared.");
                setLoading(false);
              }}
            />
            {/* Overlay on iframe to keep watermark/security layer above while
                still allowing scroll/zoom inside the iframe */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                // Let pointer events through so user can scroll inside iframe
                // (we'll separately block just the Drive control area).
                pointerEvents: "none",
                zIndex: 1002,
                background: "transparent",
              }}
            />
            {/* Small blocker over Google Drive's top-right toolbar area to
                prevent clicks on the pop-out/download controls without
                affecting scrolling in the main document area. */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "220px",
                height: "80px",
                pointerEvents: "auto",
                zIndex: 1003,
                background: "transparent",
              }}
            />
          </div>
        )}

        {!loading && !error && fileType === "docx" && (
          <div
            ref={docxContainerRef}
            style={{
              width: "100%",
              maxWidth: "1200px",
              backgroundColor: "#fff",
              padding: "40px",
              borderRadius: "4px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
          />
        )}
      </div>

      {/* PDF Controls */}
      {!loading && !error && fileType === "pdf" && numPages && (
        <div
          style={{
            padding: "15px 20px",
            backgroundColor: "#1a1a1a",
            borderTop: "1px solid #333",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            style={{
              padding: "8px 16px",
              backgroundColor: pageNumber <= 1 ? "#333" : "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: pageNumber <= 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <span style={{ color: "#fff" }}>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            style={{
              padding: "8px 16px",
              backgroundColor: pageNumber >= numPages ? "#333" : "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: pageNumber >= numPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div
        style={{
          padding: "10px 20px",
          backgroundColor: "#1a1a1a",
          borderTop: "1px solid #333",
          textAlign: "center",
          color: "#999",
          fontSize: "12px",
        }}
      >
        {/* This document is protected. Screenshots and downloads are disabled. */}
      </div>
    </div>
  );
}

