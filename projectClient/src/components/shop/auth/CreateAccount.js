import React, { useEffect, useState } from "react";
import { otpVerification, signup, signUpInit } from "./fetchApi";
import { useHistory } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateAccount = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(60);
  const [isSeller, setIsSeller] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const history = useHistory();
  const sitename = process.env.REACT_APP_BUSINESS_NAME;
  const businessProduct = process.env.REACT_APP_BUSINESS_PRODUCT;

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && !email.trim()) {
      newErrors.email = "Email is required";
    }
    if (step === 2 && !otp.trim()) {
      newErrors.otp = "OTP is required";
    }
    if (step === 3) {
      if (!name.trim()) newErrors.name = "Name is required";
      if (!password.trim()) newErrors.password = "Password is required";
      if (!confirmPassword.trim())
        newErrors.confirmPassword = "Confirm Password is required";
      if (password && confirmPassword && password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (isSeller) {
        if (!phone.trim()) newErrors.phone = "Phone number is required";
        if (!address.trim()) newErrors.address = "Address is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (isLoading) return;
    if (!validateStep()) return; // Validate inputs before proceeding
    setIsLoading(true);

    try {
      if (step === 1) {
        const response = await signUpInit({ email });
        if (response.status === 200) {
          setStep(2);
          setErrors({}); // Clear errors on successful validation
          setResendTimer(60); // Reset timer
          toast.success("OTP sent successfully!");
        } else if(response.status === 409) {
          toast.error("Email already exists. Please login.");
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      } else if (step === 2) {
        const response = await otpVerification({ email, otp });
        if (response.status === 200) {
          localStorage.setItem("tempjwt", response.data.accessToken);
          setStep(3);
          setErrors({});
          toast.success("OTP verified successfully!");
        } else if(response.status === 400){
          toast.error("Incorrect OTP. Please try again.");
        } else if(response.status === 403){
          toast.error("Regenerate OTP");
        } else if(response.status === 410){
          toast.error("OTP expired. Please try again.");
        }
      } else if (step === 3) {
        const userData = {
          name,
          password,
          cPassword: confirmPassword,
          userRole: isSeller ? 1 : 0,
          ...(isSeller && { phone, address })
        };
        
        const response = await signup(userData);
        if (response.status === 200) {
          localStorage.removeItem("tempjwt");
          toast.success(`Account created successfully! ${isSeller ? "You can now sell your products." : ""}`);
          history.push("/");
        } else if(response.status === 409){
          toast.error("Email already exists. Please login.");
        } else {
          toast.error("Failed to create account. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return; // Prevent resending before timer ends
    setIsLoading(true);
    try {
      const response = await signUpInit({ email });
      if (response.status === 200) {
        setResendTimer(60); // Reset timer
        toast.success("OTP resent successfully!");
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error during OTP resend:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Enter Your Email</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mb-4">{errors.email}</p>
            )}
            <button
              onClick={handleNextStep}
              disabled={isLoading}
              style={{ background: isLoading ? "#ccc" : "#303031" }}
              className={`w-full py-2 rounded-md text-white ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Loading..." : "Next"}
            </button>
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Enter OTP</h2>
            <input
              type="text"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 ${
                errors.otp ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.otp && <p className="text-red-500 text-sm mb-4">{errors.otp}</p>}
            <button
              onClick={handleNextStep}
              disabled={isLoading}
              style={{ background: isLoading ? "#ccc" : "#303031" }}
              className={`w-full py-2 rounded-md text-white ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Loading..." : "Next"}
            </button>
            <button
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || isLoading}
              className={`w-full mt-2 py-2 rounded-md text-white ${
                resendTimer > 0 || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : "Resend OTP"}
            </button>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Create Your Account</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mb-4">{errors.name}</p>}
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mb-4">{errors.password}</p>
            )}
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mb-4">{errors.confirmPassword}</p>
            )}
            
            {/* Seller Account Checkbox */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSeller}
                  onChange={(e) => setIsSeller(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Do you want to create a seller account?</span>
              </label>
            </div>
            
            {/* Seller-specific fields */}
            {isSeller && (
              <>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 ${
                    errors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mb-4">{errors.phone}</p>
                )}
                <textarea
                  placeholder="Business address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 ${
                    errors.address ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                  rows={3}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mb-4">{errors.address}</p>
                )}
              </>
            )}
            
            <button
              onClick={handleNextStep}
              disabled={isLoading}
              className={`w-full py-2 rounded-md text-white ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isLoading ? "Loading..." : "Create Account"}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-300">
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Section */}
        <div className="md:w-1/2 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-black flex flex-col justify-center">
          <div className="bg-yellow-400 bg-opacity-40 p-6 rounded-lg">
            <h1 className="text-4xl font-extrabold mb-4">Welcome to<br/>{sitename}</h1>
            <p className="text-lg mb-4">
              Your one-stop shop for all your {businessProduct} needs.
            </p>
            <ul className="space-y-2">
              <li>📚 Discover a wide range of {businessProduct}s across various genres.</li>
              <li>💸 Enjoy exclusive discounts and offers.</li>
              <li>🤝 Join our community of {businessProduct} lovers today!</li>
              {isSeller && (
                <li className="font-bold">💰 Sell your {businessProduct}s and reach thousands of customers!</li>
              )}
            </ul>
            <button className="mt-6 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-200"
              onClick={() => history.push("/")}
            >
              Explore Now
            </button>
          </div>
        </div>
    
        {/* Right Section */}
        <div className="md:w-1/2 p-2 bg-gray-50 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {renderStep()}
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;