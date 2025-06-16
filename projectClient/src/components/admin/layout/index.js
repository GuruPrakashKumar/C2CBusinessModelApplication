import React, { Fragment } from "react";

import AdminNavber from "../partials/AdminNavber";
import AdminSidebar from "../partials/AdminSidebar";
import AdminFooter from "../partials/AdminFooter";

const AdminLayout = ({ children }) => {
  return (
    <Fragment>
      <AdminNavber />
      <section className="flex bg-gray-100">
        {/* <AdminSidebar /> */} {/*Removed Sidebar enhancing UI*/}
        <div className="min-h-screen w-full h-full">
          {/* All Children pass from here */}
          {children}
        </div>
      </section>
      {/* <AdminFooter /> */}
    </Fragment>
  );
};

export default AdminLayout;
