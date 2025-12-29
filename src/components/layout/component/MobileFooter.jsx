import React from "react";
import { Link } from "react-router-dom";
export default function MobileFooter() {
  return (
    <>
      <div className="mobile-footer px-20 py-20 border-top-light js-mobile-footer">
        <div className="mobile-footer__number">
          <div className="text-17 fw-500 text-dark-1">Call us</div>
          <div className="text-17 fw-500 text-purple-1">+91 1800 XXX XXXX</div>
        </div>

        <div className="lh-2 mt-10">
          <div>
            Sample Papers for Class 10, 11 & 12
            <br /> India
          </div>
          <div>contact@edunoble.com</div>
        </div>

        <div className="mobile-socials mt-10">
          <Link
            to="#"
            className="d-flex items-center justify-center rounded-full size-40"
          >
            <i className="fa fa-facebook"></i>
          </Link>

          <Link
            to="#"
            className="d-flex items-center justify-center rounded-full size-40"
          >
            <i className="fa fa-twitter"></i>
          </Link>

          <Link
            to="#"
            className="d-flex items-center justify-center rounded-full size-40"
          >
            <i className="fa fa-instagram"></i>
          </Link>

          <Link
            to="#"
            className="d-flex items-center justify-center rounded-full size-40"
          >
            <i className="fa fa-linkedin"></i>
          </Link>
        </div>
      </div>
    </>
  );
}
