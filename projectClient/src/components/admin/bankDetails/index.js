import React, { Fragment, createContext, useReducer } from "react";
import AdminLayout from "../layout";
import SellerBankDetails from "./SellerBankDetails";

const BankDetailComponent = () => {
  return (
    <div className="grid grid-cols-1 space-y-4 p-4">
      <SellerBankDetails />
    </div>
  );
};

const BankDetails = (props) => {

  return (
    <Fragment>
        <AdminLayout children={<BankDetailComponent />} />
    </Fragment>
  );
};

export default BankDetails;
