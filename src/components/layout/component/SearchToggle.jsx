import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import { getApiUrl } from "@/config/api";
import SecureDocumentViewer from "@/components/common/SecureDocumentViewer";

const SearchToggle = ({ allClasses, color }) => {
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePaper, setActivePaper] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  // Debounced search for papers
  useEffect(() => {
    // Only search when there is some text
    if (!searchTerm.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("search", searchTerm.trim());
        params.append("limit", "5");
        params.append("offset", "0");

        const response = await fetch(
          `${getApiUrl("papers")}?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.isSuccess && result.data) {
          setResults(result.data.items || []);
        } else {
          throw new Error(result.message || "Failed to fetch search results");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error searching papers:", err);
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300ms

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

  const handleOpenViewer = (paper) => {
    setActivePaper(paper);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setActivePaper(null);
  };

  return (
    <>
      <div className={allClasses ? allClasses : ""}>
        <button
          onClick={() => setActiveSearch((pre) => !pre)}
          className={`d-flex items-center ${color ? color : "text-white"} `}
          data-el-toggle=".js-search-toggle"
        >
          <i className="text-20 icon icon-search"></i>
        </button>

        <div
          className={`toggle-element js-search-toggle ${
            activeSearch ? "-is-el-visible" : ""
          }`}
        >
          <div
            className="header-search pt-90 bg-white shadow-4 "
            style={{ height: "650px" }}
          >
            <div className="container">
              <div className="header-search__field">
                <div className="icon icon-search text-dark-1"></div>
                <input
                  required
                  type="text"
                  className="col-12 text-18 lh-12 text-dark-1 fw-500"
                  placeholder="Search sample papers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button
                  onClick={() => setActiveSearch(false)}
                  className="d-flex items-center justify-center size-40 rounded-full bg-purple-3"
                  data-el-toggle=".js-search-toggle"
                >
                  <img src="/assets/img/menus/close.svg" alt="icon" />
                </button>
              </div>

              <div className="header-search__content mt-30">
                {!searchTerm && !loading && !error && (
                  <div className="text-16 text-dark-1">
                    Start typing to search sample papers. Top 5 matches will
                    appear here.
                  </div>
                )}

                {loading && (
                  <div className="text-16 text-dark-1">Searching...</div>
                )}

                {error && (
                  <div className="text-16 text-red-1">Error: {error}</div>
                )}

                {!loading && !error && results.length > 0 && (
                  <>
                    <div className="text-17 text-dark-1 fw-500 mb-10">
                      Results
                    </div>
                    <div className="d-flex y-gap-10 flex-column mt-10">
                      {results.map((paper) => (
                        <div
                          key={paper._id}
                          className="d-flex flex-column text-left cursor"
                          onClick={() => handleOpenViewer(paper)}
                        >
                          <div className="text-14 text-light-1">
                            Class {paper.class} • {paper.subject} •{" "}
                            {paper.year}
                          </div>
                          <div className="text-15 text-dark-1 fw-500">
                            {paper.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {!loading && !error && searchTerm && results.length === 0 && (
                  <div className="text-16 text-dark-1">
                    No papers found matching "{searchTerm}".
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className="header-search__bg"
            data-el-toggle=".js-search-toggle"
          ></div>
        </div>
      </div>

      {showViewer && activePaper && (
        <SecureDocumentViewer
          fileUrl={activePaper.fileUrl}
          onClose={handleCloseViewer}
          title={activePaper.title}
        />
      )}
    </>
  );
};

export default SearchToggle;
