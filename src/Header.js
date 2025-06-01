import React from "react";
import "./Header.css";
import logo from "../assets/yjcc-logo.svg";

const Header = () => {
  return (
    <header className="main-header">
      <div className="logo-container">
        <img src={logo} alt="YJCC Prague Logo" className="logo" />
      </div>
      <div className="header-title">
        <h1>YJCC Prague</h1>
        <h2>קהילת הישראלים הצעירה בפראג</h2>
      </div>
    </header>
  );
};

export default Header;
