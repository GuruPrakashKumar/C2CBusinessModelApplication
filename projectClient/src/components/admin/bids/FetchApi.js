import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

// export const getAllProduct = async () => {
//   try {
//     let res = await axios.get(`${apiURL}/api/product/all-product`);
//     return res.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

export const getAllBidsOfSeller = async () => {
  try {
    let sellerId = JSON.parse(localStorage.getItem("jwt")).user._id;
    let res = await axios.post(`${apiURL}/api/bid/seller-all-bids`, {
      sellerId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
export const respondBid = async (action, bidId) => {
  //call respond bid
  try {
    let sellerId = JSON.parse(localStorage.getItem("jwt")).user._id;
    let res = await axios.post(`${apiURL}/api/bid/respond/${bidId}`, {
      action: action,
      userId: sellerId
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
}