import React, { Fragment, useEffect, useContext } from "react";
import moment from "moment";
import { fetchOrderByUser } from "./Action";
import Layout, { DashboardUserContext } from "./Layout";
import { useToast } from "../../../context/ToastContext";

const apiURL = process.env.REACT_APP_API_URL;

const OrderStatus = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Not processed":
        return "text-red-600 bg-red-100";
      case "Processing":
        return "text-yellow-600 bg-yellow-100";
      case "Shipped":
        return "text-blue-600 bg-blue-100";
      case "Delivered":
        return "text-green-600 bg-green-100";
      case "Cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <span
      className={`block rounded-full text-center text-xs px-2 py-1 font-semibold ${getStatusStyles(
        status
      )}`}
    >
      {status}
    </span>
  );
};

const OrderCard = ({ order }) => {
  const { showInfoToast } = useToast();
  return (
    <div className="border border-grey-600 pb-2 rounded-lg mb-4">
      {/* Top Section with Grey Background */}
      <div className="flex justify-between items-center bg-gray-200 pb-2 mb-2 rounded-t-lg px-4 py-2">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-black">Order Placed: </span>
            {moment(order.createdAt).format("LLL")}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-black">Total: </span>₹ {order.amount}.00
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-black">Payment ID: </span>
            {order.razorpay_payment_id || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-black">Order ID: </span>
            {order.razorpay_order_id}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Status:</p>
          <OrderStatus status={order.status} />
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-black">Last Status Update: </span>
            {moment(order.updatedAt).format("LL")}
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="mt-4 px-4">
        <p className="font-semibold text-lg mb-2">Products:</p>
        {order.allProduct.map((product, index) => (
          <div key={index} className="flex items-center space-x-4 mb-2">
            <img
              className="w-16 h-16 object-cover rounded-lg"
              src={`${product.id?.pImages[0]?? "Image not available"}`}
              alt={product.id?.pName ?? "Product not available"}
            />
            <div>
              <p className="font-semibold">{product.id?.pName}</p>
              <p className="text-sm text-gray-600">
                Quantity: {product.quantitiy}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Info */}
      <div className="mt-2 px-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-black">Delivery Address: </span>
          {order.address}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-black">Phone: </span>
          {order.phone}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 mt-4 px-4">
        <button className="border border-black px-3 py-1 rounded-full text-black text-xs hover:bg-gray-100"
          onClick={() => showInfoToast('Feature Coming soon.')}
        >
          {order.status === "Cancelled" ?
           "Raise Issue" : `Raise Issue / ${order.status === "Delivered" ? "Refund" : "Cancel"} Order`}

        </button>
        {order.status === "Not processed" || order.status === "Processing" ? (
          <button className="border border-black px-3 py-1 rounded-full text-black text-xs hover:bg-gray-100"
            onClick={() => showInfoToast('Feature Coming soon.')}
          >
            Edit Address
          </button>
        ) : null}
      </div>
    </div>
  );
};

const OrdersComponent = () => {
  const { data, dispatch } = useContext(DashboardUserContext);
  const { OrderByUser: orders } = data;

  useEffect(() => {
    fetchOrderByUser(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (data.loading) {
    return (
      <div className="w-full md:w-10/12 flex items-center justify-center py-24">
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
    );
  }

  return (
    <Fragment>
      <div className="flex flex-col w-full my-4 md:my-0 md:w-10/12 md:px-8">
        <div className="py-4 px-4 text-lg font-semibold border-t-2 border-yellow-700">
          Orders
        </div>
        <div className="bg-white shadow-lg p-4">
          {orders && orders.length > 0 ? (
            orders.map((order, i) => <OrderCard key={i} order={order} />)
          ) : (
            <p className="text-xl text-center font-semibold py-8">
              No orders found
            </p>
          )}
        </div>
      </div>
    </Fragment>
  );
};

const UserOrders = (props) => {
  return (
    <Fragment>
      <Layout children={<OrdersComponent />} />
    </Fragment>
  );
};

export default UserOrders;
