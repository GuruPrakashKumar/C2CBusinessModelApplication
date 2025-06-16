import React, { Fragment, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { getAllProduct } from "../../admin/products/FetchApi";
import { HomeContext } from "./index";
import { isWishReq, unWishReq, isWish } from "./Mixins";

const apiURL = process.env.REACT_APP_API_URL;

const SingleProduct = (props) => {
  const { data, dispatch } = useContext(HomeContext);
  const { products } = data;
  const history = useHistory();

  /* WhisList State */
  const [wList, setWlist] = useState(
    JSON.parse(localStorage.getItem("wishList"))
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      let responseData = await getAllProduct();
      setTimeout(() => {
        if (responseData && responseData.Products) {
          dispatch({ type: "setProducts", payload: responseData.Products });
          dispatch({ type: "loading", payload: false });
        }
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  if (data.loading) {
    //skeleton ui
    return (
      <Fragment>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="relative rounded border-2 px-1 py-1 col-span-1 m-1 animate-pulse">
            {/* Image placeholder */}
            <div className="w-full bg-gray-200" style={{ height: "160px" }}></div>
            
            {/* Product name placeholder */}
            <div className="mt-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            
            {/* Rating placeholder */}
            <div className="flex items-center justify-between mt-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex items-center space-x-1">
                <div className="h-4 bg-gray-200 rounded w-4"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
            </div>
            
            {/* Price placeholder */}
            <div className="h-4 bg-gray-200 rounded w-1/3 mt-1"></div>
            
            {/* Wishlist icon placeholder */}
            <div className="absolute top-0 right-0 mx-2 my-2 md:mx-4">
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </Fragment>
    );
  }

  // Filter products with active status
  const activeProducts = products ? products.filter(product => product.pStatus === "Active") : [];

  return (
    <Fragment>
      {activeProducts && activeProducts.length > 0 ? (
        activeProducts.map((item, index) => {
          return (
            <Fragment key={index}>
              <div className="relative rounded border-2 px-1 py-1 col-span-1 m-1">
                <img
                  onClick={(e) => history.push(`/products/${item._id}`)}
                  className="w-full object-cover object-center cursor-pointer"
                  src={`${item.pImages[0]}`}
                  alt=""
                  style={{ objectFit: "contain", width: "100%", height: "160px" }}//todo: fix this ui
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-gray-600 font-light truncate">
                    {item.pName}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>
                      <svg
                        className="w-4 h-4 fill-current text-yellow-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </span>
                    <span className="text-gray-700">
                      {item.pRatingsReviews.length}
                    </span>
                  </div>
                </div>
                <div>₹{item.pPrice}.00</div>
                {/* WhisList Logic  */}
                <div className="absolute top-0 right-0 mx-2 my-2 md:mx-4">
                  <svg
                    onClick={(e) => isWishReq(e, item._id, setWlist)}
                    className={`${
                      isWish(item._id, wList) && "hidden"
                    } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700 transition-all duration-300 ease-in`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <svg
                    onClick={(e) => unWishReq(e, item._id, setWlist)}
                    className={`${
                      !isWish(item._id, wList) && "hidden"
                    } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700 transition-all duration-300 ease-in`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* WhisList Logic End */}
              </div>
            </Fragment>
          );
        })
      ) : (
        <div className="col-span-2 md:col-span-3 lg:col-span-4 flex items-center justify-center py-24 text-2xl">
          No active products found
        </div>
      )}
    </Fragment>
  );
};

export default SingleProduct;