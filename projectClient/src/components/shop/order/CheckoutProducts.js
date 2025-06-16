import React, { Fragment, useEffect, useContext, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { LayoutContext } from "../layout";
import { subTotal, quantity, totalCost } from "../partials/Mixins";

import { cartListProduct } from "../partials/FetchApi";
import { createRazorpayOrder, fetchPayment, getBrainTreeToken, getPaymentProcess } from "./FetchApi";
import { fetchData, fetchbrainTree, pay } from "./Action";

import DropIn from "braintree-web-drop-in-react";

import GooglePayButton from "@google-pay/button-react";
import { useToast } from "../../../context/ToastContext";
import QRCode from "react-qr-code";
const apiURL = process.env.REACT_APP_API_URL;

export const CheckoutComponent = (props) => {
  const history = useHistory();
  const { data, dispatch } = useContext(LayoutContext);
  // const paymentUrl = 'https://pay.google.com/gp/v2/object/payment?amount=10.00&currency=INR&merchantId=BCR2DN4TX7P272AU'
  let totalPrice = totalCost().toString()
  const paymentUrl = `upi://pay?pa=guruprakash950@oksbi&pn=Guru%20Prakash&am=${totalPrice}&cu=INR&aid=uGICAgICX86axFg` //for showing qr code in checkout page
  const [responseState, setResponseState] = useState([]);
  const { showSuccessToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const CUSTOMER_NAME = localStorage.getItem("name");
  const CUSTOMER_EMAIL = localStorage.getItem("email");

  const loadScript = (src) => {//for loading razorpay script
    return new Promise((resolve)=>{
      const script = document.createElement('script')
      script.src = src;
      script.onload = () =>{
        resolve(true)
      }
      script.onerror = () =>{
        resolve(true)
      }
      document.body.appendChild(script);
    })
  }

  const createMyRazorpayOrder = async (amount) => {
    createRazorpayOrder(amount).then((data) => {
      // console.log('data after generating order id: ', data.order_id)
      handleRazorpayScreen(data.amount, data.order_id)
    })
  }
  const handleRazorpayScreen = async (amount, orderId) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if(!res){
      alert('Razorpay SDK failed to load. Are you online?')
      setIsLoading(false);
      return
    }
    const options={
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: amount,
      name: process.env.REACT_APP_BUSINESS_NAME,
      description: `Payment to ${process.env.REACT_APP_BUSINESS_NAME}`,
      image: process.env.REACT_APP_FAVICON_URL,
      order_id: orderId,
      handler: function(response){
        setResponseState(response)
        const razorpay_payment_id = response.razorpay_payment_id;
        const razorpay_order_id = response.razorpay_order_id;
        const razorpay_signature = response.razorpay_signature;
        fetchPayment(response.razorpay_payment_id).then((data) => {
          if(data.status === 'captured'){
            dispatch({ type: "loading", payload: true });
            pay(data, dispatch, state, setState, history, razorpay_payment_id, razorpay_order_id, razorpay_signature, setIsLoading);
            showSuccessToast('Order Placed Successfully')
          }
        })
      },
      prefill: {
        name: CUSTOMER_NAME,
        email: CUSTOMER_EMAIL,
        contact: state.phone
      },
      theme: {
        color: "#303031"
      },
      modal: {
        ondismiss: function () {// button gets enabled when the popup is closed
          setIsLoading(false);
        },
      },
    }
    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
    paymentObject.on('payment.failed', function(response){
      setIsLoading(false);//not needed because the razorpay window does not closes after payment failure
    })
  }

  const [state, setState] = useState({
    address: "",
    phone: "",
    error: false,
    success: false,
    clientToken: null,
    instance: {},
  });

  useEffect(() => {
    fetchData(cartListProduct, dispatch);
    fetchbrainTree(getBrainTreeToken, setState);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg
          className="w-12 h-12 animate-spin text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
        Please wait untill finish
      </div>
    );
  }
  return (
    <Fragment>
      <section className="mx-4 mt-20 md:mx-12 md:mt-32 lg:mt-24">
        <div className="text-2xl mx-2">Order</div>
        {/* Product List */}
        <div className="flex flex-col md:flex md:space-x-2 md:flex-row">
          <div className="md:w-1/2">
            <CheckoutProducts products={data.cartProduct} />
          </div>
          <div className="w-full order-first md:order-last md:w-1/2">
            {state.clientToken !== null ? (
              <Fragment>
                <div
                  onBlur={(e) => setState({ ...state, error: false })}
                  className="p-4 md:p-8"
                >
                  {state.error ? (
                    <div className="bg-red-200 py-2 px-4 rounded">
                      {state.error}
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="flex flex-col py-2">
                    <label htmlFor="address" className="pb-2">
                      Delivery Address
                    </label>
                    <input
                      value={state.address}
                      onChange={(e) =>
                        setState({
                          ...state,
                          address: e.target.value,
                          error: false,
                        })
                      }
                      type="text"
                      id="address"
                      className="border px-4 py-2"
                      placeholder="Address..."
                    />
                  </div>
                  <div className="flex flex-col py-2 mb-2">
                    <label htmlFor="phone" className="pb-2">
                      Phone
                    </label>
                    <input
                      value={state.phone}
                      onChange={(e) =>
                        setState({
                          ...state,
                          phone: e.target.value,
                          error: false,
                        })
                      }
                      type="number"
                      id="phone"
                      className="border px-4 py-2"
                      placeholder="+91"
                    />
                  </div>
                  <DropIn
                    options={{
                      authorization: state.clientToken,
                      paypal: {
                        flow: "vault",
                      },
                    }}
                    onInstance={(instance) => (state.instance = instance)}
                  />
                  <div
                    onClick={(e) =>{
                      if(isLoading) return;
                      setIsLoading(true);
                      createMyRazorpayOrder(totalPrice)
                    }}
                    className={`w-full px-4 py-2 text-center text-white font-semibold cursor-pointer ${isLoading ? 'bg-gray-500' : 'bg-black'}`}
                    style={{ background: isLoading ? '#d3d3d3' : '#303031' }}
                    disabled={isLoading}
                  >
                    Pay now
                  </div>
                  {/* <div>
                    <GooglePayButton
                      environment="TEST"
                      buttonSizeMode="fill"
                      paymentRequest={{
                        apiVersion: 2,
                        apiVersionMinor: 0,
                        allowedPaymentMethods: [
                          {
                            type: 'CARD',
                            parameters: {
                              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                              allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
                            },
                            tokenizationSpecification: {
                              type: 'PAYMENT_GATEWAY',
                              parameters: {
                                'gateway': 'example',
                                'gatewaymerchantid': 'examplegatewaymerchantid',
                              },
                            },
                          },
                        ],
                        merchantInfo: {
                          merchantName: 'Guru Prakash Kumar',
                        },
                        transactionInfo: {
                          totalPriceStatus: 'FINAL',
                          totalPriceLabel: 'Total',
                          totalPrice: totalCost().toString(),
                          currencyCode: 'INR',
                          countryCode: 'IN',
                        },
                        shippingAddressRequired: true,
                      }}
                      onLoadPaymentData={paymentData=>{
                        console.log('TODO: send order to server', paymentData.paymentMethodData)
                      }}
                    />

                  </div> */}
                  {/* <div style={{ marginTop: '20px' }}>
                    <h3>Pay Using QR Code</h3>
                    <div style={{ height: "auto", margin: "20 auto", maxWidth: 100, width: "100%" }}>
                      <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%", marginTop: '20px' }}
                        value={paymentUrl}
                        viewBox={`0 0 256 256`}
                        />
                    </div>
                    <h2>Do not pay using this QR code. This is for testing purpose</h2>
                  </div> */}
                  
                </div>
              </Fragment>
            ) : (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="w-12 h-12 animate-spin text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

const CheckoutProducts = ({ products }) => {
  const history = useHistory();

  return (
    <Fragment>
      <div className="grid grid-cols-2 md:grid-cols-1">
        {products !== null && products.length > 0 ? (
          products.map((product, index) => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const cartItem = cart.find(cartItem => cartItem.id === product._id);
            const productPrice = cartItem ? cartItem.price : product.pPrice;
            return (
              <div
                key={index}
                className="col-span-1 m-2 md:py-6 md:border-t md:border-b md:my-2 md:mx-0 md:flex md:items-center md:justify-between"
              >
                <div className="md:flex md:items-center md:space-x-4">
                  <img
                    onClick={(e) => history.push(`/products/${product._id}`)}
                    className="cursor-pointer md:h-20 md:w-20 object-cover object-center"
                    src={`${product.pImages[0]}`}
                    alt="wishListproduct"
                  />
                  <div className="text-lg md:ml-6 truncate">
                    {product.pName}
                  </div>
                  <div className="md:ml-6 font-semibold text-gray-600 text-sm">
                    Price : ₹{productPrice}.00{" "}
                  </div>
                  <div className="md:ml-6 font-semibold text-gray-600 text-sm">
                    Quantitiy : {quantity(product._id)}
                  </div>
                  <div className="font-semibold text-gray-600 text-sm">
                    Subtotal : ₹{subTotal(product._id, productPrice)}.00
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div>No product found for checkout</div>
        )}
      </div>
    </Fragment>
  );
};

export default CheckoutProducts;
