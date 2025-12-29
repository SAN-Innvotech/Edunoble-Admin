import React, { useState, useEffect } from "react";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getApiUrl } from "@/config/api";

export default function Faq() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch FAQ data from API
  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(getApiUrl("contact/faq"));

        if (!response.ok) {
          throw new Error(`Failed to fetch FAQ: ${response.status}`);
        }

        const result = await response.json();

        if (result.isSuccess && result.data) {
          // Map API response to component format, filter active items, and sort by order
          const mappedFaq = result.data
            .filter((item) => item.isActive !== false) // Only show active FAQs
            .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
            .map((item, index) => ({
              id: item._id || index + 1, // Use _id as id, fallback to index
              question: item.question,
              answer: item.answer,
            }));
          setFaq(mappedFaq);
        } else {
          throw new Error(result.message || "Failed to fetch FAQ");
        }
      } catch (err) {
        console.error("Error fetching FAQ:", err);
        setError(err.message);
        setFaq([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaq();
  }, []);
  return (
    <section className="layout-pt-lg layout-pb-lg bg-light-4">
      <div className="container">
        <div className="row justify-center text-center">
          <div className="col-xl-8 col-lg-9 col-md-11">
            <div className="sectionTitle ">
              <h2 className="sectionTitle__title ">
                Frequently Asked Questions
              </h2>

              <p className="sectionTitle__text ">
                Find answers to common questions about our sample papers for Class 10, 11, and 12
              </p>
            </div>

            {loading && (
              <div className="text-center pt-60 lg:pt-40">
                <div className="text-16 text-dark-1">Loading FAQs...</div>
              </div>
            )}

            {error && (
              <div className="text-center pt-60 lg:pt-40">
                <div className="text-16 text-red-1">Error: {error}</div>
              </div>
            )}

            {!loading && !error && faq.length === 0 && (
              <div className="text-center pt-60 lg:pt-40">
                <div className="text-16 text-dark-1">No FAQs available</div>
              </div>
            )}

            {!loading && !error && faq.length > 0 && (
              <div className="accordion -block text-left pt-60 lg:pt-40 js-accordion">
                {faq.map((elm, i) => (
                <div
                  onClick={() =>
                    setActiveFaq((pre) => (pre == elm.id ? 0 : elm.id))
                  }
                  key={i}
                  className={`accordion__item  ${
                    activeFaq == elm.id ? "is-active" : ""
                  }`}
                >
                  <div className="accordion__button">
                    <div className="accordion__icon">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        className="icon"
                        data-feather="plus"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        className="icon"
                        data-feather="minus"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </div>
                    </div>
                    <span className="text-17 fw-500 text-dark-1">
                      {elm.question}
                    </span>
                  </div>

                  <div
                    style={activeFaq == elm.id ? { maxHeight: "500px" } : {}}
                    className="accordion__content"
                  >
                    <div className="accordion__content__inner">
                      <p>{elm.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
