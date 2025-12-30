import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="no-page layout-pt-lg layout-pb-lg bg-beige-1">
      <div className="container">
        <div className="row y-gap-50 justify-between items-center">
          <div className="col-lg-6">
            <div className="no-page__img">
              <img src="/assets/img/404/1.svg" alt="image" />
            </div>
          </div>

          <div className="col-xl-5 col-lg-6">
            <div className="no-page__content">
              <h1 className="no-page__main text-dark-1">
                40<span className="text-purple-1">4</span>
              </h1>
              <h2 className="text-35 lh-12 mt-5">
                Oops! Page Not Found
              </h2>
              <div className="mt-10">
                The page you're looking for doesn't exist. Don't worry! 
                <br /> Browse our sample papers for Class 10, 11, and 12 or return to the homepage.
              </div>
              <Link to="/dshb-papers" className="button -md -purple-1 text-white mt-20">
                Go Back To Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
