import React from "react";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className="site-header border-bottom">
      <div className="sticky-header main-bar-wraper navbar-expand-lg">
        <div className="main-bar clearfix">
          <div className="container-fluid d-lg-flex d-block">

            {/* Logo */}
            <div className="logo-header me-md-4">
              <img src="/images/logo.png" alt="logo" />
            </div>

            {/* Navbar */}
            <Navbar />

            {/* Right Icons */}
            <div className="extra-nav">
              <ul className="header-right">
                <li>
                  <a href="/registration">Login / Register</a>
                </li>
                <li>
                  <button data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop">
                    🔍
                  </button>
                </li>
                <li>
                  <button data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight">
                    ❤️
                  </button>
                </li>
                <li>
                  <button data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight">
                    🛒
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;