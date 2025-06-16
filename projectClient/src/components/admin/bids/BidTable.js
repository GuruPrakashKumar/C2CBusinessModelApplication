import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllBidsOfSeller, respondBid, respondToBid } from './FetchApi';

const SellerBidsPage = () => {
  const [bidsData, setBidsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentBid, setCurrentBid] = useState(null);
  const [action, setAction] = useState('accept');
  const [counterPrice, setCounterPrice] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await getAllBidsOfSeller();
        setBidsData(response);
      } catch (error) {
        toast.error('Failed to fetch bids: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  const toggleProductExpand = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const openResponseModal = (bid) => {
    setCurrentBid(bid);
    setAction('accept');
    setCounterPrice('');
    setShowResponseModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setCurrentBid(null);
  };

  const handleRespondToBid = async () => {
    if (!currentBid) return;
    
    setResponseLoading(true);
    try {
      const response = await respondBid(action, currentBid._id);
      
      toast.success(`Bid ${action}ed successfully`);
      
      // Refresh bids data
      const updatedBids = await getAllBidsOfSeller();
      setBidsData(updatedBids);
      
      closeResponseModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to respond to bid');
    } finally {
      setResponseLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      countered: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!bidsData || bidsData.products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No bids found</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't received any bids yet.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Response Modal */}
      {showResponseModal && currentBid && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Respond to Bid</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="accept">Accept Bid</option>
                  <option value="reject">Reject Bid</option>
                  <option value="counter">Counter Offer</option>
                </select>
              </div>

              {action === 'counter' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Counter Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                      placeholder="0.00"
                      min={currentBid.userBid + 1}
                      step="1"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be higher than the current bid (₹{currentBid.userBid})
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeResponseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRespondToBid}
                  disabled={responseLoading || (action === 'counter' && (!counterPrice || counterPrice <= currentBid.userBid))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {responseLoading ? 'Processing...' : 'Submit Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Manage Bids</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all bids on your products
          </p>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Product
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total Bids
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Your Price
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {bidsData.products.map((productGroup) => (
                    <React.Fragment key={productGroup.product._id}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer" 
                        onClick={() => toggleProductExpand(productGroup.product._id)}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={productGroup.product.pImages[0] || '/placeholder-product.jpg'} 
                                alt={productGroup.product.pName} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{productGroup.product.pName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {productGroup.bids.length}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ₹{productGroup.product.pPrice}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductExpand(productGroup.product._id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {expandedProduct === productGroup.product._id ? 'Hide' : 'View'} bids
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded row for bids */}
                      {expandedProduct === productGroup.product._id && (
                        <tr>
                          <td colSpan="5" className="bg-gray-50 px-4 py-4">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                  <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Bidder</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bid Amount</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {productGroup.bids.map((bid) => (
                                    <tr key={bid._id}>
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                        <div className="flex items-center">
                                          <div className="ml-4">
                                            <div className="font-medium text-gray-900">{bid.bUser.name}</div>
                                            <div className="text-gray-500">{bid.bUser.email}</div>
                                            {bid.bUser.phone && (
                                              <div className="text-gray-500">{bid.bUser.phone}</div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        ₹{bid.userBid}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {getStatusBadge(bid.bStatus)}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {formatDate(bid.createdAt)}
                                      </td>
                                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        {bid.bStatus === 'pending' || bid.bStatus === 'countered' ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openResponseModal(bid);
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                          >
                                            Respond
                                          </button>
                                        ) : (
                                          <span className="text-gray-400">Completed</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerBidsPage;