import React, { Fragment, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

const AdminNavber = (props) => {
  const history = useHistory();
  const location = useLocation(); // Get the current location
  const siteName = process.env.REACT_APP_BUSINESS_NAME;
  const dropdownRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishList");
    window.location.href = "/";
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const navigateTo = (path) => {
    setDropdownVisible(false); // Close the dropdown
    history.push(path); // Navigate to the desired path
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  return (
    <Fragment>
      <nav className="sticky z-10 flex items-center shadow-md justify-between px-4 py-4 md:px-8 top-0 w-full bg-white">
        {/* Hamberger Icon */}
        <div className="lg:hidden flex lg:items- relative">
          <span>
            <svg
              id="hamburgerBtn"
              className="w-8 h-8 cursor-pointer text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              onClick={toggleDropdown}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </span>
          {dropdownVisible && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10"
            >
              <div
                onClick={() => navigateTo("/admin/dashboard")}
                className={`hover:bg-gray-200 cursor-pointer py-2 px-4 rounded-lg flex items-center ${location.pathname === "/admin/dashboard" ? "bg-gray-200" : ""}`}
                title="Dashboard"
              >
                <DashboardIcon />
                <span className="ml-2 text-black font-semibold">Dashboard</span>
              </div>
              <div
                onClick={() => navigateTo("/admin/dashboard/categories")}
                className={`hover:bg-gray-200 cursor-pointer py-2 px-4 rounded-lg flex items-center ${location.pathname === "/admin/dashboard/categories" ? "bg-gray-200": ""}`}
                title="Categories"
              >
                <CategoriesIcon />
                <span className="ml-2 text-black font-semibold">Categories</span>
              </div>
              <div
                onClick={() => navigateTo("/admin/dashboard/products")}
                className={`hover:bg-gray-200 cursor-pointer py-2 px-4 rounded-lg flex items-center ${location.pathname === "/admin/dashboard/products" ? "bg-gray-200" : "" }`}
                title="Products"
              >
                <ProductsIcon />
                <span className="ml-2 text-black font-semibold">Products</span>
              </div>
              <div
                onClick={() => navigateTo("/admin/dashboard/orders")}
                className={`hover:bg-gray-200 cursor-pointer py-2 px-4 rounded-lg flex items-center ${
                  location.pathname === "/admin/dashboard/orders"
                    ? "bg-gray-200"
                    : ""
                }`}
                title="Orders"
              >
                <OrdersIcon />
                <span className="ml-2 text-black font-semibold">Orders</span>
              </div>
            </div>
          )}
        </div>
          {/*  Large Screen Show  */}
        {/* <div className="hidden lg:block">
          <span
            onClick={(e) => history.push("/admin/dashboard")}
            style={{ letterSpacing: "0.70rem" }}
            className="flex items-left text-center font-bold uppercase text-gray-800 text-2xl cursor-pointer px-2 text-center"
          >
            {siteName}
          </span>
        </div> */}
        {/* Small Screen Show */}
        {/* <div className="lg:hidden flex items-center">
          <svg
            id="hamburgerBtn"
            className="lg:hidden w-8 h-8 cursor-pointer text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span
            onClick={(e) => history.push("/admin/dashboard")}
            style={{ letterSpacing: "0.10rem" }}
            className="flex items-left text-center font-bold uppercase text-gray-800 text-2xl cursor-pointer px-2 text-center"
          >
            {siteName}
          </span>
        </div> */}
        {/* Navigating icons for Both Screen show */}
        <div className="flex items-center ml-auto">
          {/* Dashboard Icon */}
          <div
            onClick={() => history.push("/admin/dashboard")}
            className={`hover:bg-gray-200 cursor-pointer py-2 px-2 rounded-lg flex items-center ${location.pathname === "/admin/dashboard" ? "bg-gray-200" : ""}`}
            title="Dashboard"
          >
            <DashboardIcon />
            <span className="ml-1 text-black font-semibold hidden sm:block">Dashboard</span>
          </div>
          {/* Categories Icon */}
          <div
            onClick={() => history.push("/admin/dashboard/categories")}
            className={`hover:bg-gray-200 cursor-pointer py-2 px-2 rounded-lg flex items-center ${
              location.pathname === "/admin/dashboard/categories"
                ? "bg-gray-200"
                : ""
            }`}
            title="Categories"
          >
            <CategoriesIcon />
            <span className="ml-1 text-black font-semibold hidden sm:block">Categories</span>
          </div>
          {/* Products Icon */}
          <div
            onClick={() => history.push("/admin/dashboard/products")}
            className={`hover:bg-gray-200 cursor-pointer py-2 px-2 rounded-lg flex items-center ${
              location.pathname === "/admin/dashboard/products"
                ? "bg-gray-200"
                : ""
            }`}
            title="Products"
          >
            <ProductsIcon />
            <span className="ml-1 text-black font-semibold hidden sm:block">Products</span>
          </div>
          {/* Orders Icon */}
          <div
            onClick={() => history.push("/admin/dashboard/orders")}
            className={`hover:bg-gray-200 cursor-pointer py-2 px-2 rounded-lg flex items-center ${
              location.pathname === "/admin/dashboard/orders" ? "bg-gray-200" : ""
            }`}
            title="Orders"
          >
            <OrdersIcon />
            <span className="ml-1 text-black font-semibold hidden sm:block">Orders</span>
          </div>
          <div
            onClick={() => history.push("/admin/dashboard/bids")}
            className={`hover:bg-gray-200 cursor-pointer py-2 px-2 rounded-lg flex items-center ${
              location.pathname === "/admin/dashboard/bids" ? "bg-gray-200" : ""
            }`}
            title="Bids"
          >
            {/* Bargain Icon present in public folder */}
            <img
              src="/bargain_icon.png"
              alt="Bargain Icon"
              className="w-6 h-6"
            />
            <span className="ml-1 text-black font-semibold hidden sm:block">Bids</span>
          </div>
          {/* Logout Button Dropdown */}
          <div
            className="userDropdownBtn hover:bg-gray-200 px-2 py-2 rounded-lg relative"
            title="Logout"
          >
            <svg
              className="cursor-pointer w-7 h-8 text-black hover:text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="userDropdown absolute right-0 mt-1 bg-gray-200 rounded">
              <li className="flex flex-col text-gray-700">
                <span
                  onClick={(e) => history.push("/")}
                  className="flex space-x-1 py-2 px-8 hover:bg-gray-400 cursor-pointer"
                >
                  <span>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </span>
                  <span>Shop</span>
                </span>
                <span onClick ={(e) => history.push('/admin/dashboard/bankDetails')}
                  className="flex space-x-1 py-2 px-8 hover:bg-gray-400 cursor-pointer">
                  <span>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  <span>Account</span>
                </span>
                <span
                  onClick={(e) => logout()}
                  className="flex space-x-1 py-2 px-8 hover:bg-gray-400 cursor-pointer"
                >
                  <span>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </span>
                  <span>Logout</span>
                </span>
              </li>
            </div>
          </div>
        </div>
        {/* Mobile Navber */}
        {/* End Mobile Navber */}
      </nav>
    </Fragment>
  );
};

// Dashboard Icon Component
const DashboardIcon = () => (
  <svg
    className="w-6 h-8 text-black hover:text-gray-800"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// Categories Icon Component
const CategoriesIcon = () => (
  <svg
    className="w-6 h-8 text-black hover:text-gray-800"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

// Products Icon Component
const ProductsIcon = () => (
  <svg
    className="w-6 h-8 text-black hover:text-gray-800"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    />
  </svg>
);

// Orders Icon Component
const OrdersIcon = () => (
  <svg
    className="w-6 h-8 text-black hover:text-gray-800"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

export default AdminNavber;