import { samplePaperSortingOptions } from "@/data/courses";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PaginationTwo from "../common/PaginationTwo";
import SamplePaperCard from "../homes/courseCards/SamplePaperCard";
import { getApiUrl } from "@/config/api";

export default function CourseListThree() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Function to extract numeric part from class (e.g., "12th" -> "12")
  const extractClassNumber = (classStr) => {
    if (!classStr) return "";
    // Extract numbers from the string (e.g., "12th" -> "12", "10th" -> "10")
    const match = classStr.match(/\d+/);
    return match ? match[0] : classStr;
  };
  
  // Initialize filters from URL parameters
  const getInitialFilters = () => {
    const classParam = searchParams.get("class");
    const subjectParam = searchParams.get("subject");
    return {
      class: classParam ? [extractClassNumber(classParam)] : [],
      subject: subjectParam ? [subjectParam] : [],
    };
  };
  
  const initialFilters = getInitialFilters();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterClass, setFilterClass] = useState(initialFilters.class);
  const [filterSubject, setFilterSubject] = useState(initialFilters.subject);
  const [filterBoard, setFilterBoard] = useState([]);
  const [filterYear, setFilterYear] = useState([]);
  const [filterExamType, setFilterExamType] = useState([]);

  // Metadata from API
  const [metadata, setMetadata] = useState({
    classes: [],
    subjects: [],
    boards: [],
    years: [],
    examTypes: [],
  });
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState(null);

  // Papers data from API
  const [papers, setPapers] = useState([]);
  const [papersLoading, setPapersLoading] = useState(true);
  const [papersError, setPapersError] = useState(null);
  const [totalPapers, setTotalPapers] = useState(0);

  const [currentSortingOption, setCurrentSortingOption] = useState("Default");

  const [pageNumber, setPageNumber] = useState(1);
  const limit = 8; // Number of cards per page

  // Fetch metadata from API
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setMetadataLoading(true);
        setMetadataError(null);
        const response = await fetch(getApiUrl("papers/metadata"));

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.status}`);
        }

        const result = await response.json();

        if (result.isSuccess && result.data) {
          setMetadata({
            classes: result.data.classes || [],
            subjects: result.data.subjects || [],
            boards: result.data.boards || [],
            years: result.data.years || [],
            examTypes: result.data.examTypes || [],
          });
        } else {
          throw new Error(result.message || "Failed to fetch metadata");
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setMetadataError(err.message);
        // Fallback to empty arrays on error
        setMetadata({
          classes: [],
          subjects: [],
          boards: [],
          years: [],
          examTypes: [],
        });
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Update filters when URL parameters change (for navigation between categories)
  // This handles the case when user navigates from one category to another
  useEffect(() => {
    const classParam = searchParams.get("class");
    const subjectParam = searchParams.get("subject");
    const currentClass = filterClass.length > 0 ? filterClass[0] : null;
    const currentSubject = filterSubject.length > 0 ? filterSubject[0] : null;

    // Update filters only if URL params differ from current filters
    if (classParam) {
      const normalizedClass = extractClassNumber(classParam);
      if (normalizedClass !== currentClass) {
        setFilterClass([normalizedClass]);
      }
    } else if (currentClass) {
      // Clear filter if URL param was removed
      setFilterClass([]);
    }
    
    if (subjectParam !== currentSubject) {
      setFilterSubject(subjectParam ? [subjectParam] : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Map UI sort options to API sortBy values
  const getSortByValue = useCallback((sortOption) => {
    const sortMap = {
      "Default": "default",
      "Year (Newest)": "year-newest",
      "Year (Oldest)": "year-oldest",
      "Class (Asc)": "class-asc",
      "Class (Desc)": "class-desc",
      "Subject (A-Z)": "subject-asc",
      "Subject (Z-A)": "subject-desc",
    };
    return sortMap[sortOption] || "default";
  }, []);

  // Fetch papers from API
  const fetchPapers = useCallback(async () => {
    try {
      setPapersLoading(true);
      setPapersError(null);

      // Build query parameters
      const params = new URLSearchParams();
      
      // Add filter parameters (only if filters are selected)
      if (filterClass.length > 0) {
        params.append("class", filterClass.join(","));
      }
      if (filterSubject.length > 0) {
        params.append("subject", filterSubject.join(","));
      }
      if (filterBoard.length > 0) {
        params.append("board", filterBoard.join(","));
      }
      if (filterYear.length > 0) {
        // Convert year strings to integers for API
        const yearInts = filterYear.map(y => parseInt(y));
        params.append("year", yearInts.join(","));
      }
      if (filterExamType.length > 0) {
        params.append("examType", filterExamType.join(","));
      }

      // Add pagination
      const offset = (pageNumber - 1) * limit;
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      // Add sorting
      params.append("sortBy", getSortByValue(currentSortingOption));

      const response = await fetch(`${getApiUrl("papers")}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch papers: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        setPapers(result.data.items || []);
        setTotalPapers(result.data.pagination?.total || 0);
      } else {
        throw new Error(result.message || "Failed to fetch papers");
      }
    } catch (err) {
      console.error("Error fetching papers:", err);
      setPapersError(err.message);
      setPapers([]);
      setTotalPapers(0);
    } finally {
      setPapersLoading(false);
    }
  }, [filterClass, filterSubject, filterBoard, filterYear, filterExamType, pageNumber, currentSortingOption, getSortByValue, limit]);

  // Fetch papers when filters, pagination, or sorting changes
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleFilterClass = (item) => {
    // Single select: if already selected, deselect; otherwise, replace selection
    if (filterClass.length > 0 && filterClass[0] === item) {
      setFilterClass([]);
    } else {
      setFilterClass([item]);
    }
    setPageNumber(1); // Reset to first page when filter changes
  };
  const handleFilterSubject = (item) => {
    // Single select: if already selected, deselect; otherwise, replace selection
    if (filterSubject.length > 0 && filterSubject[0] === item) {
      setFilterSubject([]);
    } else {
      setFilterSubject([item]);
    }
    setPageNumber(1);
  };
  const handleFilterBoard = (item) => {
    // Single select: if already selected, deselect; otherwise, replace selection
    if (filterBoard.length > 0 && filterBoard[0] === item) {
      setFilterBoard([]);
    } else {
      setFilterBoard([item]);
    }
    setPageNumber(1);
  };
  const handleFilterYear = (item) => {
    // Single select: if already selected, deselect; otherwise, replace selection
    if (filterYear.length > 0 && filterYear[0] === item) {
      setFilterYear([]);
    } else {
      setFilterYear([item]);
    }
    setPageNumber(1);
  };
  const handleFilterExamType = (item) => {
    // Single select: if already selected, deselect; otherwise, replace selection
    if (filterExamType.length > 0 && filterExamType[0] === item) {
      setFilterExamType([]);
    } else {
      setFilterExamType([item]);
    }
    setPageNumber(1);
  };

  // Calculate total number of active filters
  const getActiveFilterCount = () => {
    return (
      filterClass.length +
      filterSubject.length +
      filterBoard.length +
      filterYear.length +
      filterExamType.length
    );
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      <section className="page-header -type-1" style={{ marginTop: "60px" }}>
        <div className="container">
          <div className="page-header__content">
            <div className="row">
              <div className="col-auto">
                <div>
                  <h1 className="page-header__title">Sample Papers</h1>
                </div>

                <div>
                  <p className="page-header__text">
                    Explore sample papers curated for Class 10th, 11th and 12th.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="accordion js-accordion">
            <div
              className={`accordion__item ${filterOpen ? "is-active" : ""} `}
            >
              <div className="row y-gap-20 items-center justify-between pb-30">
                <div className="col-auto">
                  <div className="text-14 lh-12">
                    Showing{" "}
                    <span className="text-dark-1 fw-500">
                      {papersLoading ? "..." : totalPapers}
                    </span>{" "}
                    sample papers
                  </div>
                </div>

                <div className="col-auto">
                  <div className="row x-gap-20 y-gap-20">
                    <div className="col-auto">
                      <div className="d-flex items-center">
                        <div className="text-14 lh-12 fw-500 text-dark-1 mr-20">
                          Sort by:
                        </div>

                        <div
                          id="dd61button"
                          className="dropdown js-dropdown js-category-active"
                        >
                          <div
                            className="dropdown__button d-flex items-center text-14 rounded-8 px-20 py-10 text-14 lh-12"
                            onClick={() => {
                              document
                                .getElementById("dd61button")
                                .classList.toggle("-is-dd-active");
                              document
                                .getElementById("dd61content")
                                .classList.toggle("-is-el-visible");
                            }}
                            data-el-toggle=".js-category-toggle"
                            data-el-toggle-active=".js-category-active"
                          >
                            <span className="js-dropdown-title">
                              {currentSortingOption}
                            </span>
                            <i className="icon text-9 ml-40 icon-chevron-down"></i>
                          </div>

                          <div
                            id="dd61content"
                            className="toggle-element -dropdown -dark-bg-dark-2 -dark-border-white-10 js-click-dropdown js-category-toggle"
                          >
                            <div className="text-14 y-gap-15 js-dropdown-list">
                              {samplePaperSortingOptions.map((elm, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    const newSort = currentSortingOption == elm ? "Default" : elm;
                                    setCurrentSortingOption(newSort);
                                    setPageNumber(1); // Reset to first page when sort changes
                                    document
                                      .getElementById("dd61button")
                                      .classList.toggle("-is-dd-active");
                                    document
                                      .getElementById("dd61content")
                                      .classList.toggle("-is-el-visible");
                                  }}
                                >
                                  <span
                                    className={`d-block js-dropdown-link cursor ${
                                      currentSortingOption == elm
                                        ? "activeMenu"
                                        : ""
                                    } `}
                                  >
                                    {elm}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-auto">
                      <div
                        className="accordion__button w-unset"
                        onClick={() => setFilterOpen((pre) => !pre)}
                      >
                        <button 
                          className={`button h-50 px-30 relative ${hasActiveFilters ? 'bg-purple-1 text-white' : '-light-7 text-purple-1'}`}
                        >
                          <i className="icon-filter mr-10"></i>
                          Filter
                          {hasActiveFilters && (
                            <span 
                              className="absolute d-flex items-center justify-center bg-red-1 text-white rounded-full ml-3"
                              style={{
                                top: '4px',
                                right: '4px',
                                minWidth: '18px',
                                height: '18px',
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '0 5px',
                                lineHeight: '1',
                              }}
                            >
                              {activeFilterCount}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="accordion__content "
                style={filterOpen ? { maxHeight: "1800px" } : {}}
              >
                <div className="sidebar -courses px-30 py-30 rounded-8 bg-light-3 mb-50">
                  <div className="row x-gap-60 y-gap-40">
                    {/* Class Filter */}
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                      <div className="sidebar__item">
                        <h5 className="sidebar__title">Class</h5>
                        <div className="sidebar-checkbox">
                          <div
                            className="sidebar-checkbox__item cursor"
                            onClick={() => setFilterClass([])}
                          >
                            <div className="form-checkbox">
                              <input
                                type="checkbox"
                                readOnly
                                checked={filterClass.length ? false : true}
                              />
                              <div className="form-checkbox__mark">
                                <div className="form-checkbox__icon icon-check"></div>
                              </div>
                            </div>
                            <div className="sidebar-checkbox__title">All</div>
                            <div className="sidebar-checkbox__count"></div>
                          </div>
                          {metadata.classes.map((cls, index) => (
                              <div
                                className="sidebar-checkbox__item cursor"
                                key={index}
                                onClick={() => handleFilterClass(cls.name)}
                              >
                                <div className="form-checkbox">
                                  <input
                                    type="checkbox"
                                    readOnly
                                    checked={
                                      filterClass.includes(cls.name) ? true : false
                                    }
                                  />
                                  <div className="form-checkbox__mark">
                                    <div className="form-checkbox__icon icon-check"></div>
                                  </div>
                                </div>
                                <div className="sidebar-checkbox__title">
                                  Class {cls.name}
                                </div>
                                <div className="sidebar-checkbox__count">
                                  ({cls.count})
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Subject Filter */}
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                      <div className="sidebar__item">
                        <h5 className="sidebar__title">Subject</h5>
                        <div className="sidebar-checkbox">
                          <div
                            className="sidebar-checkbox__item cursor"
                            onClick={() => setFilterSubject([])}
                          >
                            <div className="form-checkbox">
                              <input
                                type="checkbox"
                                readOnly
                                checked={filterSubject.length ? false : true}
                              />
                              <div className="form-checkbox__mark">
                                <div className="form-checkbox__icon icon-check"></div>
                              </div>
                            </div>
                            <div className="sidebar-checkbox__title">All</div>
                            <div className="sidebar-checkbox__count"></div>
                          </div>
                          {metadata.subjects.map((subject, index) => (
                              <div
                                className="sidebar-checkbox__item cursor"
                                key={index}
                                onClick={() => handleFilterSubject(subject.name)}
                              >
                                <div className="form-checkbox">
                                  <input
                                    type="checkbox"
                                    readOnly
                                    checked={
                                      filterSubject.includes(subject.name)
                                        ? true
                                        : false
                                    }
                                  />
                                  <div className="form-checkbox__mark">
                                    <div className="form-checkbox__icon icon-check"></div>
                                  </div>
                                </div>
                                <div className="sidebar-checkbox__title">
                                  {subject.name}
                                </div>
                                <div className="sidebar-checkbox__count">
                                  ({subject.count})
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Board Filter */}
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                      <div className="sidebar__item">
                        <h5 className="sidebar__title">Board</h5>
                        <div className="sidebar-checkbox">
                          <div
                            className="sidebar-checkbox__item cursor"
                            onClick={() => setFilterBoard([])}
                          >
                            <div className="form-checkbox">
                              <input
                                type="checkbox"
                                readOnly
                                checked={filterBoard.length ? false : true}
                              />
                              <div className="form-checkbox__mark">
                                <div className="form-checkbox__icon icon-check"></div>
                              </div>
                            </div>
                            <div className="sidebar-checkbox__title">All</div>
                            <div className="sidebar-checkbox__count"></div>
                          </div>
                          {metadata.boards.map((board, index) => (
                              <div
                                className="sidebar-checkbox__item cursor"
                                key={index}
                                onClick={() => handleFilterBoard(board.name)}
                              >
                                <div className="form-checkbox">
                                  <input
                                    type="checkbox"
                                    readOnly
                                    checked={
                                      filterBoard.includes(board.name) ? true : false
                                    }
                                  />
                                  <div className="form-checkbox__mark">
                                    <div className="form-checkbox__icon icon-check"></div>
                                  </div>
                                </div>
                                <div className="sidebar-checkbox__title">
                                  {board.name}
                                </div>
                                <div className="sidebar-checkbox__count">
                                  ({board.count})
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Year Filter */}
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                      <div className="sidebar__item">
                        <h5 className="sidebar__title">Year</h5>
                        <div className="sidebar-checkbox">
                          <div
                            className="sidebar-checkbox__item cursor"
                            onClick={() => setFilterYear([])}
                          >
                            <div className="form-checkbox">
                              <input
                                type="checkbox"
                                readOnly
                                checked={filterYear.length ? false : true}
                              />
                              <div className="form-checkbox__mark">
                                <div className="form-checkbox__icon icon-check"></div>
                              </div>
                            </div>
                            <div className="sidebar-checkbox__title">All</div>
                            <div className="sidebar-checkbox__count"></div>
                          </div>
                          {metadata.years.map((year, index) => {
                            const yearStr = year.name.toString();
                            return (
                              <div
                                className="sidebar-checkbox__item cursor"
                                key={index}
                                onClick={() => handleFilterYear(yearStr)}
                              >
                                <div className="form-checkbox">
                                  <input
                                    type="checkbox"
                                    readOnly
                                    checked={
                                      filterYear.includes(yearStr) ? true : false
                                    }
                                  />
                                  <div className="form-checkbox__mark">
                                    <div className="form-checkbox__icon icon-check"></div>
                                  </div>
                                </div>
                                <div className="sidebar-checkbox__title">
                                  {yearStr}
                                </div>
                                <div className="sidebar-checkbox__count">
                                  ({year.count})
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Exam Type Filter */}
                    <div className="col-xl-3 col-lg-4 col-sm-6">
                      <div className="sidebar__item">
                        <h5 className="sidebar__title">Exam Type</h5>
                        <div className="sidebar-checkbox">
                          <div
                            className="sidebar-checkbox__item cursor"
                            onClick={() => setFilterExamType([])}
                          >
                            <div className="form-checkbox">
                              <input
                                type="checkbox"
                                readOnly
                                checked={filterExamType.length ? false : true}
                              />
                              <div className="form-checkbox__mark">
                                <div className="form-checkbox__icon icon-check"></div>
                              </div>
                            </div>
                            <div className="sidebar-checkbox__title">All</div>
                            <div className="sidebar-checkbox__count"></div>
                          </div>
                          {metadata.examTypes.map((examType, index) => (
                              <div
                                className="sidebar-checkbox__item cursor"
                                key={index}
                                onClick={() => handleFilterExamType(examType.name)}
                              >
                                <div className="form-checkbox">
                                  <input
                                    type="checkbox"
                                    readOnly
                                    checked={
                                      filterExamType.includes(examType.name)
                                        ? true
                                        : false
                                    }
                                  />
                                  <div className="form-checkbox__mark">
                                    <div className="form-checkbox__icon icon-check"></div>
                                  </div>
                                </div>
                                <div className="sidebar-checkbox__title">
                                  {examType.name}
                                </div>
                                <div className="sidebar-checkbox__count">
                                  ({examType.count})
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {papersLoading && (
            <div className="row y-gap-30">
              <div className="col-12 text-center py-50">
                <div className="text-16 text-dark-1">Loading papers...</div>
              </div>
            </div>
          )}

          {papersError && (
            <div className="row y-gap-30">
              <div className="col-12 text-center py-50">
                <div className="text-16 text-red-1">Error: {papersError}</div>
              </div>
            </div>
          )}

          {!papersLoading && !papersError && (
            <>
              <div className="row y-gap-30">
                {papers.length > 0 ? (
                  papers.map((paper, i) => (
                    <SamplePaperCard key={paper._id || i} paper={paper} />
                  ))
                ) : (
                  <div className="col-12 text-center py-50">
                    <div className="text-16 text-dark-1">No papers found</div>
                  </div>
                )}
              </div>

              <div className="row justify-center pt-90 lg:pt-50">
                <div className="col-auto">
                  <PaginationTwo
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    data={Array(totalPapers).fill(null)} // Create array with total count for pagination
                    pageCapacity={limit}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
