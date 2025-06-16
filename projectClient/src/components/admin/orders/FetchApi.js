import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getAllOrder = async () => {
  try {
    let sellerId = JSON.parse(localStorage.getItem("jwt")).user._id;
    
    let res = await axios.post(`${apiURL}/api/order/get-all-orders`, { sellerId });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const editCategory = async (oId, status) => {
  let data = { oId: oId, status: status };
  console.log(data);
  try {
    let res = await axios.post(`${apiURL}/api/order/update-order`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteOrder = async (oId) => {
  let data = { oId: oId };
  try {
    let res = await axios.post(`${apiURL}/api/order/delete-order`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
