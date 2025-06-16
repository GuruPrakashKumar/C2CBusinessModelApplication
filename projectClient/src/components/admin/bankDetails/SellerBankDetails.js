import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const SellerBankDetails = () => {
    const apiURL = process.env.REACT_APP_API_URL;
  const sellerId = JSON.parse(localStorage.getItem("jwt")).user._id;
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    fetchBankDetails();
  }, [sellerId]);

  const fetchBankDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiURL}/api/seller-bank/${sellerId}`);
      
      if (response.data.success) {
        setBankDetails(response.data.data);
        // setVerificationStatus(response.data.data.isVerified ? 'Verified' : 'Not Verified');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No bank details found, allow to create new
        setIsEditing(true);
      } else {
        toast.error('Failed to fetch bank details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post(`${apiURL}/api/seller-bank/${sellerId}`, bankDetails);

      if (response.data.success) {
        toast.success('Bank details saved successfully!');
        setIsEditing(false);
        // setVerificationStatus('Pending Verification'); // Reset status after update
        fetchBankDetails(); // Refresh the data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bank details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Bank Account Details</h2>
      
      {/* {verificationStatus && (
        <div className={`mb-4 p-3 rounded-md ${verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          Status: {verificationStatus}
        </div>
      )} */}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="accountHolderName">
                Account Holder Name
              </label>
              <input
                type="text"
                id="accountHolderName"
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="accountNumber">
                Bank Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="bankName">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ifscCode">
                IFSC Code
              </label>
              <input
                type="text"
                id="ifscCode"
                name="ifscCode"
                value={bankDetails.ifscCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Holder Name</h3>
              <p className="text-lg">{bankDetails.accountHolderName || 'Not provided'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Number</h3>
              <p className="text-lg">
                {bankDetails.accountNumber 
                  ? `${bankDetails.accountNumber.substring(0, 4)}****${bankDetails.accountNumber.substring(bankDetails.accountNumber.length - 4)}`
                  : 'Not provided'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Bank Name</h3>
              <p className="text-lg">{bankDetails.bankName || 'Not provided'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">IFSC Code</h3>
              <p className="text-lg">{bankDetails.ifscCode || 'Not provided'}</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Edit Bank Details
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>For security reasons, your full account number is not displayed.</p>
            {/* {verificationStatus !== 'Verified' && (
              <p className="mt-2 text-yellow-600">
                Note: Your account details must be verified before you can receive payments.
              </p>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerBankDetails;