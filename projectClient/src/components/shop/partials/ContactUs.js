import React, { Fragment, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Layout from "../layout";

const ContactUs = () => {
  const businessAddress = process.env.REACT_APP_BUSINESS_ADDRESS;
  const businessPhone = process.env.REACT_APP_BUSINESS_PHONE;
  const businessEmail = process.env.REACT_APP_BUSINESS_EMAIL;

  // State for form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone:""
  });

  // State for loading and response message
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  // Handle input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Show loading state

    try {
        const apiURL = process.env.REACT_APP_API_URL;
        const response = await axios.post(`${apiURL}/email/sendResponse`, formData);
  
        if (response.status === 200) {
          toast.success('Your message has been sent successfully!', {position: "bottom-center",theme: "colored",});
          // Clear the form
          setFormData({ name: "", email: "", message: "", phone: "" });
        } else {
          toast.error('Oops! Something went wrong. Please try again.', {position: "bottom-center",theme: "colored",});
        }
      } catch (error) {
        toast.error('An error occurred. Please try again later.', {position: "bottom-center",theme: "colored",});
      } finally {
        setLoading(false); // Hide loading state
      }
  };

  return (
    <div className="bg-gray-50 min-h-screen justify-center py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Section: Contact Form */}
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-4">
            Have questions? We'd love to hear from you. Fill out the form and we’ll get back to you as soon as possible!
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>
            {/* Phone Field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium">
                Phone Number
              </label>
              <input
                type="number"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block text-gray-700 font-medium"
              >
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="5"
                placeholder="Write your message here..."
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md"
              disabled={loading}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>

          {/* Response Message */}
          {responseMessage && (
            <p
              className={`mt-4 text-center ${
                responseMessage.includes("successfully")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {responseMessage}
            </p>
          )}
        </div>

        {/* Right Section: Company Details */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Contact Info</h2>
            <p className="text-gray-600 mt-2">
              Reach out to us via email, phone, or visit us at our store.
            </p>
          </div>

          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start">
              <div className="text-yellow-600 w-8 h-8 flex justify-center items-center bg-yellow-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21.75c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9s-9 4.03-9 9c0 4.97 4.03 9 9 9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7.5v6m0 0l3 3m-3-3l-3 3"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">Our Store</h3>
                <p className="text-gray-600">
                  {businessAddress}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start">
              <div className="text-yellow-600 w-8 h-8 flex justify-center items-center bg-yellow-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5.5l8.59 8.59a1.5 1.5 0 002.12 0L21 6.5m-4 7V18a3 3 0 01-3 3h-6a3 3 0 01-3-3v-4.5m15-5.5v5a2 2 0 002 2h.5a2 2 0 002-2v-5a2 2 0 00-2-2h-.5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">Phone</h3>
                <p className="text-gray-600">{businessPhone}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start">
              <div className="text-yellow-600 w-8 h-8 flex justify-center items-center bg-yellow-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5.5l8.59 8.59a1.5 1.5 0 002.12 0L21 6.5m-4 7V18a3 3 0 01-3 3h-6a3 3 0 01-3-3v-4.5m15-5.5v5a2 2 0 002 2h.5a2 2 0 002-2v-5a2 2 0 00-2-2h-.5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">Email</h3>
                <p className="text-gray-600">{businessEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

const ContactUsPage = (props)=>{
    return (
        <Layout children={<ContactUs/>}/>
    )
}

export default ContactUsPage;
