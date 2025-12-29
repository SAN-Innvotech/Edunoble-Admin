import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "@/config/api";

const CategoriesHomeOne = () => {
  const [showSlider, setShowSlider] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Available icon paths (1.svg through 6.svg)
  const availableIcons = [
    "/assets/img/featureCards/1.svg",
    "/assets/img/featureCards/2.svg",
    "/assets/img/featureCards/3.svg",
    "/assets/img/featureCards/4.svg",
    "/assets/img/featureCards/5.svg",
    "/assets/img/featureCards/6.svg",
  ];

  // Function to get a random icon
  const getRandomIcon = (index) => {
    return availableIcons[index % availableIcons.length];
  };

  // Function to extract numeric part from class (e.g., "12th" -> "12")
  const extractClassNumber = (classStr) => {
    if (!classStr) return "";
    // Extract numbers from the string (e.g., "12th" -> "12", "10th" -> "10")
    const match = classStr.match(/\d+/);
    return match ? match[0] : classStr;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("papers/subjects-by-class"));

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const result = await response.json();

        if (result.isSuccess && result.data) {
          // map to component format
          const mappedCategories = result.data
            .map((item, index) => ({
              id: index + 1,
              iconSrc: getRandomIcon(index),
              title: `${item.class} ${item.subject}`,
              text: `${item.paperCount} Papers`,
              class: item.class,
              subject: item.subject,
            }));
          setCategories(mappedCategories);
        } else {
          throw new Error(result.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      } finally {
        setLoading(false);
        setShowSlider(true);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle ">
                <h2 className="sectionTitle__title ">
                  Most Viewed Subjects
                </h2>

                <p className="sectionTitle__text ">
                  Explore sample papers by subject and class for CBSE, ICSE and
                  State Boards.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden pt-50 js-section-slider">
            {showSlider && !loading && categories.length > 0 && (
              <Swiper
                // {...setting}

                modules={[Navigation, Pagination]}
                pagination={{
                  el: ".swiper-paginationx",
                  clickable: true,
                }}
                navigation={{
                  nextEl: ".arrow-right-one",
                  prevEl: ".arrow-left-one",
                }}
                spaceBetween={30}
                slidesPerView={1}
                breakpoints={{
                  // when window width is >= 576px
                  450: {
                    slidesPerView: 2,
                  },
                  // when window width is >= 768px
                  768: {
                    slidesPerView: 4,
                  },
                  1200: {
                    // when window width is >= 992px
                    slidesPerView: 6,
                  },
                }}
                loop={categories.length > 1}
              >
                {categories.map((item, i) => {
                  const classNumber = extractClassNumber(item.class);
                  return (
                    <SwiperSlide key={item.id}>
                      <Link
                        to={`/papers?class=${encodeURIComponent(classNumber)}&subject=${encodeURIComponent(item.subject)}`}
                        data-aos="fade-left"
                        data-aos-duration={(i + 1) * 350}
                        className="featureCard -type-1 -featureCard-hover linkCustomTwo"
                      >
                      <div className="featureCard__content">
                        <div className="featureCard__icon">
                          <img src={item.iconSrc} alt="icon" />
                        </div>
                        <div className="featureCard__title">
                          {item.title.split(" ")[0]} <br />
                          {item.title.split(" ")[1] && item.title.split(" ")[1]}
                        </div>
                        <div className="featureCard__text">{item.text}</div>
                      </div>
                    </Link>
                  </SwiperSlide>
                  );
                })}
              </Swiper>
            )}

            <div className="d-flex justify-center x-gap-15 items-center pt-60 lg:pt-40">
              <div className="col-auto">
                <button className="d-flex items-center text-24 arrow-left-hover js-prev">
                  <i className="icon icon-arrow-left arrow-left-one"></i>
                </button>
              </div>
              <div className="col-auto">
                <div className="swiper-paginationx"></div>
              </div>
              <div className="col-auto">
                <button className="d-flex items-center text-24 arrow-right-hover js-next">
                  <i className="icon icon-arrow-right arrow-right-one"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CategoriesHomeOne;
