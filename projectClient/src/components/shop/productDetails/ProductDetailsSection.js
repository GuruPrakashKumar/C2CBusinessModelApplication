import React, { Fragment, useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ProductDetailsContext } from "./index";
import { LayoutContext } from "../layout";
import Submenu from "./Submenu";
import ProductDetailsSectionTwo from "./ProductDetailsSectionTwo";

import { getBidForUser, getSingleProduct } from "./FetchApi";
import { cartListProduct } from "../partials/FetchApi";

import { isWishReq, unWishReq, isWish } from "../home/Mixins";
import { updateQuantity, slideImage, addToCart, cartList } from "./Mixins";
import { totalCost } from "../partials/Mixins";
import { useToast } from "../../../context/ToastContext";
import { bidSubmitHanlder, updateBid } from "./Action";
import { getUserById } from "../dashboardUser/FetchApi";

const apiURL = process.env.REACT_APP_API_URL;

const ProductDetailsSection = (props) => {
  let { id } = useParams();

  const { data, dispatch } = useContext(ProductDetailsContext);
  const { data: layoutData, dispatch: layoutDispatch } =
    useContext(LayoutContext); // Layout Context

  const sProduct = layoutData.singleProductDetail;
  const [pImages, setPimages] = useState([]);
  const [count, setCount] = useState(0); // Slide change state

  const [quantitiy, setQuantitiy] = useState(1); // Increse and decrese quantity state
  const [, setAlertq] = useState(false); // Alert when quantity greater than stock

  const [inputBidPrice, setInputBidPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    email: ""
  })
  const [fData, setFdata] = useState({
      bId: "",
      userBid: inputBidPrice,
      sellerBid: 0,
      bUser: "",
      bStatus: "",
      bSeller: "",
      product: "",
      success: false,
      error: false,
    });
  const [wList, setWlist] = useState(
    JSON.parse(localStorage.getItem("wishList"))
  ); // Wishlist State Control

  const { showInfoToast } = useToast();
  useEffect(() => {
    fetchData();
    fetchBidData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchBidData = async () => {
    console.log('fetching bid data')
    setIsLoading(true);
    try {
      const response = await getBidForUser(id);
      if (response.message =="Bid found") {
        setFdata({
          ...fData,
          bId: response.bid._id,
          userBid: response.bid.userBid,
          sellerBid: response.bid.sellerBid,
          bUser: response.bid.bUser,
          bStatus: response.bid.bStatus,
          bSeller: response.bid.bSeller,
          product: response.bid.product,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      let responseData = await getSingleProduct(id);
      const sellerData = await getUserById(responseData.Product.pSeller);
      setSellerInfo({
        ...sellerInfo,
        name: sellerData.User.name,
        phone: sellerData.User.phoneNumber,
        email: sellerData.User.email,
        address: sellerData.User.address
      })
      
      console.log('seller data: ', sellerData.User)
      setTimeout(() => {
        if (responseData.Product) {
          layoutDispatch({
            type: "singleProductDetail",
            payload: responseData.Product,
          }); // Dispatch in layout context
          setPimages(responseData.Product.pImages);
          dispatch({ type: "loading", payload: false });
          layoutDispatch({ type: "inCart", payload: cartList() }); // This function change cart in cart state
        }
        if (responseData.error) {
          console.log(responseData.error);
        }
      }, 500);
    } catch (error) {
      console.log(error);
    }
    fetchCartProduct(); // Updating cart total
  };

  const fetchCartProduct = async () => {
    try {
      let responseData = await cartListProduct();
      if (responseData && responseData.Products) {
        layoutDispatch({ type: "cartProduct", payload: responseData.Products }); // Layout context Cartproduct fetch and dispatch
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleBidButton = async () => {
    setIsLoading(true);
    const updatedFData = {
      ...fData,
      userBid: inputBidPrice,
      bSeller: sProduct.pSeller,
      product: sProduct._id,
    };
    setFdata(updatedFData);
    try {
      if(updatedFData.bId){
        await updateBid(updatedFData, setFdata, fetchBidData);
      }else{
        await bidSubmitHanlder(updatedFData, setFdata, fetchBidData);
      }
    } catch (error) {
      console.error("Error in bid submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (data.loading) {//shimmer
    return (
      <Fragment>
        {/* Skeleton for Submenu */}
        <div className="m-4 md:mx-12 md:my-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        </div>
        
        {/* Main Product Skeleton */}
        <section className="m-4 md:mx-12 md:my-6 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
            {/* Left side - thumbnails skeleton */}
            <div className="hidden md:block md:col-span-1 md:flex md:flex-col md:space-y-4 md:mr-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="w-20 h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            
            {/* Main image skeleton */}
            <div className="col-span-2 md:col-span-7">
              <div className="w-full h-96 bg-gray-200 rounded"></div>
            </div>
            
            {/* Right side - product details skeleton */}
            <div className="col-span-2 mt-8 md:mt-0 md:col-span-4 md:ml-6 lg:ml-12">
              <div className="flex flex-col space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                
                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/6"></div>
                </div>
                
                {/* Quantity selector skeleton */}
                <div className="border p-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex space-x-4">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                
                {/* Add to cart button skeleton */}
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Product details section two skeleton */}
        <div className="m-4 md:mx-12 md:my-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </Fragment>
    );
  } else if (!sProduct) {
    return <div>No product</div>;
  }

  // Check if product is disabled
  const isDisabled = sProduct.pStatus === "Disabled";
  const isOutOfStock = sProduct.pQuantity === 0 || isDisabled;

  return (
    <Fragment>
      <Submenu
        value={{
          categoryId: sProduct.pCategory?._id,
          product: sProduct.pName,
          category: sProduct.pCategory?.cName || "", // unknown category
        }}
      />
      <section className="m-4 md:mx-6 md:my-6">
        <div className="grid grid-cols-2 md:grid-cols-12">
          {/* Desktop thumbnails (left side) */}
          <div className="hidden md:block md:col-span-1 md:flex md:flex-col md:space-y-4 md:mr-2">
            {pImages && pImages !== null}
            {pImages.length > 0 && pImages.map((image, index) => (
              <img
                key={index}
                onClick={() => slideImage("increase", index, count, setCount, pImages)}
                className={`${count === index ? "border-2 border-black" : "opacity-25 border"} rounded-lg cursor-pointer w-20 h-20 p-1 object-cover object-center`}
                src={image}
                alt={`pic-${index}`}
              />
            ))}
          </div>
          {/* Main image section */}
          <div className="col-span-2 md:col-span-7">
            <div className="relative">
              <img
                className="w-full max-h-[500px] object-contain"
                src={`${sProduct.pImages[count]}`}
                alt="Main product image"
              />
              <div className="absolute inset-0 flex justify-between items-center mb-4">
                {/*Left arrow for sliding image*/}
                <div
                  onClick={(e) => slideImage("decrease", null, count, setCount, pImages)}
                  className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 h-full text-gray-700 opacity-25 cursor-pointer hover:text-yellow-700 hover:opacity-100"
                >
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
                {/*Right arrow for sliding image*/}
                <div
                  onClick={(e) => slideImage("increase", null, count, setCount, pImages)}
                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full text-gray-700 opacity-25 cursor-pointer hover:text-yellow-700 hover:opacity-100"
                >
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Mobile thumbnails (below main image) */}
            <div className="md:hidden flex flex-wrap justify-center mt-4 gap-2">
              {pImages.length > 0 && pImages.map((image, index) => (
                <img
                  key={index}
                  onClick={() => slideImage("increase", index, count, setCount, pImages)}
                  className={`${count === index ? "border-2 border-black" : "opacity-50 border"} rounded-lg cursor-pointer w-16 h-16 object-cover object-center`}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                />
              ))}
            </div>
          </div>
          {/* Product details */}
          <div className="col-span-2 mt-8 md:mt-0 md:col-span-4 md:ml-6 lg:ml-12">
            <div className="flex flex-col leading-8">
              <div className="text-2xl tracking-wider">{sProduct.pName}</div>
              <div className="flex justify-between items-center">
                <span className="text-xl tracking-wider text-yellow-700">
                  ₹{sProduct.pPrice}.00
                </span>
                <span>
                  <svg
                    onClick={(e) => isWishReq(e, sProduct._id, setWlist)}
                    className={`${isWish(sProduct._id, wList) && "hidden"
                      } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700`}
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
                    onClick={(e) => unWishReq(e, sProduct._id, setWlist)}
                    className={`${!isWish(sProduct._id, wList) && "hidden"
                      } w-5 h-5 md:w-6 md:h-6 cursor-pointer text-yellow-700`}
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
                </span>
              </div>
            </div>
            <div className="my-4 md:my-6 text-gray-600">
              {sProduct.pDescription}
            </div>
            <div className="my-4 md:my-6">
              {+quantitiy === +sProduct.pQuantity ? (
                <span className="text-xs text-red-500">Stock limited</span>
              ) : isDisabled ? (
                <span className="text-xs text-red-500">Product unavailable</span>
              ) : (
                ""
              )}
              <div
                className={`flex justify-between items-center px-4 py-2 border ${
                  (+quantitiy === +sProduct.pQuantity || isDisabled) && "border-red-500"
                }`}
              >
                <div className={`${quantitiy === sProduct.pQuantity || isDisabled ? "text-red-500" : ""}`}>
                  Quantity
                </div>
                
                {/* Quantity Button */}
                {!isOutOfStock ? (
                  <Fragment>
                    {layoutData.inCart == null ||
                    (layoutData.inCart !== null &&
                      layoutData.inCart.includes(sProduct._id) === false) ? (
                      <div className="flex items-center space-x-2">
                        <span
                          onClick={(e) =>
                            updateQuantity(
                              "decrease",
                              sProduct.pQuantity,
                              quantitiy,
                              setQuantitiy,
                              setAlertq
                            )
                          }
                        >
                          <svg
                            className="w-5 h-5 fill-current cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">{quantitiy}</span>
                        <span
                          onClick={(e) =>
                            updateQuantity(
                              "increase",
                              sProduct.pQuantity,
                              quantitiy,
                              setQuantitiy,
                              setAlertq
                            )
                          }
                        >
                          <svg
                            className="w-5 h-5 fill-current cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>
                          <svg
                            className="w-5 h-5 fill-current cursor-not-allowed"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="font-semibold">{quantitiy}</span>
                        <span>
                          <svg
                            className="w-5 h-5 fill-current cursor-not-allowed"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>
                      <svg
                        className="w-5 h-5 fill-current cursor-not-allowed"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="font-semibold">{quantitiy}</span>
                    <span>
                      <svg
                        className="w-5 h-5 fill-current cursor-not-allowed"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              
              {/* Add to cart button section */}
              {!isOutOfStock ? (
                <Fragment>
                  {layoutData.inCart !== null &&
                  layoutData.inCart.includes(sProduct._id) === true ? (
                    <div
                      style={{ background: "#303031" }}
                      className={`px-4 py-2 text-white text-center cursor-not-allowed uppercase opacity-75`}
                    >
                      In cart
                    </div>
                  ) : (
                    <div
                      onClick={(e) =>
                        addToCart(
                          sProduct._id,
                          quantitiy,
                          sProduct.pPrice,
                          layoutDispatch,
                          setQuantitiy,
                          setAlertq,
                          fetchData,
                          totalCost
                        )
                      }
                      style={{ background: "#303031" }}
                      className={`px-4 py-2 text-white text-center cursor-pointer uppercase`}
                    >
                      Add to cart
                    </div>
                  )}
                </Fragment>
              ) : (
                <div
                  style={{ background: "#303031" }}
                  disabled={true}
                  className="px-4 py-2 text-white opacity-50 cursor-not-allowed text-center uppercase"
                >
                  Out of stock
                </div>
              )}
            </div>
            <div>
              {/* bidding system */}
              <h6 className="text-xl font-medium mb-2">Bid Your Price</h6>
              
              {fData.bStatus === "accepted" ? (
                <div className="mb-4 p-4 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 font-medium">Seller has accepted your bid of ₹{fData.userBid}</p>
                  </div>
                  <p className="text-sm text-green-700 mt-1">You can now purchase this item at your bid price</p>
                  <button
                    onClick={(e) =>
                      addToCart(
                        sProduct._id,
                        quantitiy,
                        fData.userBid, // Using bid price instead of original price
                        layoutDispatch,
                        setQuantitiy,
                        setAlertq,
                        fetchData,
                        totalCost
                      )
                    }
                    style={{ background: "#303031" }}
                    className="mt-3 px-4 py-2 text-white text-center cursor-pointer uppercase rounded-md"
                  >
                    Add to Cart at ₹{fData.userBid}
                  </button>
                </div>
              ) : fData.bStatus === "rejected" ? (
                <div className="mb-4 p-4 bg-red-50 rounded-md border border-red-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-red-800 font-medium">Seller has declined your bid of ₹{fData.userBid}</p>
                  </div>
                  <p className="text-sm text-red-700 mt-1">You can place another bid or purchase at the original price</p>
                </div>
              ) : fData.bStatus === "countered" ? (
                <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-blue-800 font-medium">Seller countered with ₹{fData.sellerBid}</p>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">You can accept this offer or place a new bid</p>
                </div>
              ) : null}

              {fData.bStatus !== "accepted" && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Enter your bid price"
                      value={inputBidPrice}
                      onChange={(e) => setInputBidPrice(e.target.value)}
                      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      onClick={handleBidButton}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-md text-white ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {isLoading ? "Processing..." : "Place Bid"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {!inputBidPrice 
                      ? "Enter your bid amount" 
                        : "Seller will review your bid and respond soon"}
                  </p>
                </div>
              )}

              {fData.userBid && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Your Bid: ₹{fData.userBid}</p>
                  {fData.sellerBid && <p className="text-sm">Seller's Counter: ₹{fData.sellerBid}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {fData.bStatus.charAt(0).toUpperCase() + fData.bStatus.slice(1)}
                  </p>
                </div>
              )}
            </div>
            {/* Add the seller information section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Seller Information</h3>
              
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : sellerInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Seller Name</h4>
                    <p className="text-lg">{sellerInfo.name || 'Not available'}</p>
                  </div>
                  
                  {sellerInfo.phone && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                      <p className="text-lg">{sellerInfo.phone}</p>
                    </div>
                  )}
                  
                  {sellerInfo.address && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p className="text-lg">{sellerInfo.address}</p>
                    </div>
                  )}
                  {sellerInfo.email && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="text-lg">{sellerInfo.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Seller information not available</p>
              )}
              
              <button 
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition"
                onClick={() => showInfoToast('Contact seller feature coming soon!')}
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>
          
      </section>
      {/* Product Details Section two */}
      <ProductDetailsSectionTwo />
    </Fragment>
  );
};

export default ProductDetailsSection;