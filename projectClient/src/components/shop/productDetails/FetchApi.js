import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getSingleProduct = async (pId) => {
  try {
    let res = await axios.post(`${apiURL}/api/product/single-product`, {
      pId: pId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const postAddReview = async (formData) => {
  try {
    let res = await axios.post(`${apiURL}/api/product/add-review`, formData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const postDeleteReview = async (formData) => {
  try {
    let res = await axios.post(`${apiURL}/api/product/delete-review`, formData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const postPlaceBid = async (formData) => {
  try {
    let res = await axios.post(`${apiURL}/api/bid/place-bid`, formData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}
export const postUpdateBid = async (formData) => {
  try {
    let res = await axios.post(`${apiURL}/api/bid/update-bid`, formData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}
// get bid using product id for buyer view
export const getBidForUser = async (productId) => {
  try {
    const userId = JSON.parse(localStorage.getItem("jwt")).user._id;
    let res = await axios.post(`${apiURL}/api/bid/user-product-bid/${productId}`, { userId });
    return res.data;
  } catch (error) {
    console.log(error);
  }
}