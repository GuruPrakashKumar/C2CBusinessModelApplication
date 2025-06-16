import React, { Fragment, createContext, useReducer } from "react";
import AdminLayout from "../layout";
// import ProductMenu from "./ProductMenu";
// import ProductTable from "./ProductTable";
// import { productState, productReducer } from "./ProductContext";
import BidTable from "./BidTable";
/* This context manage all of the products component's data */
// export const ProductContext = createContext();

const BidComponent = () => {
  return (
    <div className="grid grid-cols-1 space-y-4 p-4">
      {/* <ProductMenu /> */}
      <BidTable />
    </div>
  );
};

const Bids = (props) => {
  /* To use useReducer make sure that reducer is the first arg */
//   const [data, dispatch] = useReducer(productReducer, productState);

  return (
    <Fragment>
      {/* <ProductContext.Provider value={{ data, dispatch }}> */}
        <AdminLayout children={<BidComponent />} />
      {/* </ProductContext.Provider> */}
    </Fragment>
  );
};

export default Bids;
