import React, { useState, useEffect } from "react";
import SamplePaperCard from "../courseCards/SamplePaperCard";
import { samplePapersData } from "../../../data/courses";
import { getApiUrl } from "@/config/api";

export default function Courses() {
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState(null);
  const [featuredPapers, setFeaturedPapers] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);

  // Fetch class metadata for tabs
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setClassesLoading(true);
        setClassesError(null);

        const response = await fetch(getApiUrl("papers/metadata"));
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.status}`);
        }

        const result = await response.json();
        if (result.isSuccess && result.data && Array.isArray(result.data.classes)) {
          setClasses(result.data.classes);
        } else {
          throw new Error(result.message || "Invalid metadata response");
        }
      } catch (err) {
        console.error("Error fetching class metadata:", err);
        setClassesError(err.message);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch featured papers (optionally filtered by class)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError(null);

        const params = new URLSearchParams();
        if (selectedClass !== "All Classes") {
          params.append("class", selectedClass);
        }

        const url =
          params.toString().length > 0
            ? `${getApiUrl("papers/featured")}?${params.toString()}`
            : getApiUrl("papers/featured");

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch featured papers: ${response.status}`);
        }

        const result = await response.json();
        if (result.isSuccess && Array.isArray(result.data)) {
          setFeaturedPapers(result.data);
        } else {
          throw new Error(result.message || "Invalid featured papers response");
        }
      } catch (err) {
        console.error("Error fetching featured papers:", err);
        setFeaturedError(err.message);
        setFeaturedPapers([]);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeatured();
  }, [selectedClass]);

  return (
    <section className="layout-pt-lg layout-pb-lg">
      <div className="row justify-center text-center">
        <div className="col-auto">
          <div className="sectionTitle ">
            <h2 className="sectionTitle__title sm:text-24">
              Featured Sample Papers
            </h2>

            <p className="sectionTitle__text ">
              Practice with curated sample papers for Class 10, 11 and 12 across
              major subjects and boards.
            </p>
          </div>
        </div>
      </div>
      <div className="tabs__controls flex-wrap  pt-50 d-flex justify-center x-gap-10 js-tabs-controls">
        {/* All Classes tab */}
        <div onClick={() => setSelectedClass("All Classes")}>
          <button
            className={`tabs__button px-15 py-8 rounded-8 js-tabs-button ${
              selectedClass === "All Classes" ? "tabActive" : ""
            } `}
            data-tab-target=".-tab-item-2"
            type="button"
          >
            All Classes
          </button>
        </div>

        {/* Dynamically loaded class tabs from metadata API */}
        {!classesLoading &&
          !classesError &&
          classes.map((cls, i) => (
            <div onClick={() => setSelectedClass(cls.name)} key={cls.name || i}>
              <button
                className={`tabs__button px-15 py-8 rounded-8 js-tabs-button ${
                  selectedClass === cls.name ? "tabActive" : ""
                } `}
                data-tab-target=".-tab-item-2"
                type="button"
              >
                Class {cls.name}
              </button>
            </div>
          ))}
      </div>

      <div
        className="pt-60 m-auto row y-gap-30 container pl-0 pr-0"
        data-aos="fade-right"
        data-aos-offset="80"
        data-aos-duration={800}
      >
        {featuredLoading && (
          <div className="col-12 text-center py-40">
            <div className="text-16 text-dark-1">Loading featured papers...</div>
          </div>
        )}

        {featuredError && !featuredLoading && (
          <div className="col-12 text-center py-40">
            <div className="text-16 text-red-1">
              Error loading featured papers: {featuredError}
            </div>
          </div>
        )}

        {!featuredLoading && !featuredError && featuredPapers.length === 0 && (
          <div className="col-12 text-center py-40">
            <div className="text-16 text-dark-1">
              No featured papers available{selectedClass !== "All Classes"
                ? ` for Class ${selectedClass}`
                : ""}
              .
            </div>
          </div>
        )}

        {!featuredLoading &&
          !featuredError &&
          featuredPapers
            .slice(0, 8)
            .map((paper, index) => (
              <SamplePaperCard key={paper._id || index} paper={paper} index={index} />
            ))}
      </div>
    </section>
  );
}
