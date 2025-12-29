import React from "react";
import { Link } from "react-router-dom";

export default function HeaderAuth() {
  return (
    <header className="header -base js-header">
      <div className="header__container py-10">
        <div className="row justify-between items-center">
          <div className="col-auto">
            <div className="header-left">
              <div className="header__logo " style={{ width: "140px" }}>
                <Link data-barba to="/">
                  <img src="/assets/img/general/logo2.png" alt="logo" />
                </Link>
              </div>
            </div>
          </div>

          <div className="col-auto">
            <div className="header-right d-flex items-center">
              {/* Navigation menu removed for login page */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
