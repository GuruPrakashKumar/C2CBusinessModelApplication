import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const createRazorpayOrder = async (amount) => {
  let data = {
    amount: amount * 100,
  }
  try {
    let res = await axios.post(`${apiURL}/api/razorpay/order`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export const fetchPayment = async (paymentId) => {
  try{
    let res = await axios.get(`${apiURL}/api/razorpay/${paymentId}`);
    return res.data;
  }catch(error){
    console.log(error);
  }
}

export const getBrainTreeToken = async () => {
  let uId = JSON.parse(localStorage.getItem("jwt")).user._id;
  try {
    let res = await axios.post(`${apiURL}/api/braintree/get-token`, {
      uId: uId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getPaymentProcess = async (paymentData) => {
  try {
    let res = await axios.post(`${apiURL}/api/braintree/payment`, paymentData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const createOrder = async (orderData) => {
  try {
    let res = await axios.post(`${apiURL}/api/order/create-order`, orderData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
