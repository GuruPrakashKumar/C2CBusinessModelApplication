import React from "react";
import { postAddReview, postDeleteReview, postPlaceBid, postUpdateBid } from "./FetchApi";
import { isAuthenticate } from "../auth/fetchApi";

export const Alert = (color, text) => (
  <div className={`bg-${color}-200 px-4 py-2 my-2 rounded`}>{text}</div>
);

export const reviewSubmitHanlder = (fData, setFdata, fetchData) => {
  if (!fData.rating || !fData.review) {
    setFdata({ ...fData, error: "Rating and review must be required" });
  } else if (!isAuthenticate()) {
    setFdata({ ...fData, error: "You must need login to review" });
  } else {
    addReview(fData, setFdata, fetchData);
  }
};

export const deleteReview = async (
  reviewId,
  productId,
  fetchData,
  setFdata
) => {
  try {
    let responseData = await postDeleteReview({
      rId: reviewId,
      pId: productId,
    });
    if (responseData.success) {
      fetchData();
      setFdata({ success: responseData.success });
    } else if (responseData.error) {
      fetchData();
    }
  } catch (error) {
    console.log(error);
  }
};

export const addReview = async (fData, setFdata, fetchData) => {
  let formData = {
    rating: fData.rating,
    review: fData.review,
    pId: fData.pId,
    uId: JSON.parse(localStorage.getItem("jwt")).user._id,
  };
  try {
    let responseData = await postAddReview(formData);
    if (responseData.success) {
      setFdata({
        ...fData,
        success: responseData.success,
        review: "",
        rating: "",
      });
      fetchData();
    } else if (responseData.error) {
      setFdata({ ...fData, error: responseData.error, review: "", rating: "" });
      fetchData();
    }
  } catch (error) {
    console.log(error);
  }
};
export const bidSubmitHanlder = (fData, setFdata, fetchData) => {
  if (fData.userBid === '0') {
    setFdata({ ...fData, error: "Bid amount is required must be required" });
  } else if (!isAuthenticate()) {
    setFdata({ ...fData, error: "You must need login to review" });
  } else {
    placeBid(fData, setFdata, fetchData);
  }
};
export const placeBid = async (fData, setFdata, fetchData) => {
  let formData = {
    userBid: fData.userBid,
    productId: fData.product,
    userId: JSON.parse(localStorage.getItem("jwt")).user._id,
    sellerId: fData.bSeller,
  };
  try {
    let responseData = await postPlaceBid(formData);
    if (responseData.success) {
      setFdata({
        ...fData,
        success: responseData.success,
        userbid: "",
      });
      fetchData();
    } else if (responseData.error) {
      setFdata({ ...fData, error: responseData.error, bid: "" });
      fetchData();
    }
  } catch (error) {
    console.log(error);
  }
}
export const updateBid = async (fData, setFdata, fetchData)=>{
  let formData ={
    userBid: fData.userBid,
    bId: fData.bId,
  }
  try {
    let responseData = await postUpdateBid(formData);
    if(responseData.success) {
      setFdata({
        ...fData,
        success: responseData.success,
        bid: "",
      });
      fetchData();
    }else if(responseData.error){
      setFdata({ ...fData, error: responseData.error, bid: "" });
      fetchData();
    }
  } catch (error) {
    console.log(error);
  }
}