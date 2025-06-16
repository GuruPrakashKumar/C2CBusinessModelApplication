import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { respondBid } from './FetchApi';

const RespondToBid = () => {
  const { bidId } = useParams();
  const history = useHistory();
  const [action, setAction] = useState('accept'); // 'accept', 'reject', or 'counter'
  const [counterPrice, setCounterPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
    //   const token = localStorage.getItem('auth-token');
      const response = await respondBid(action, bidId);
      if(response){
        console.log(response)
      }
      toast.success(`Bid ${action}ed successfully`);
      history.goBack(); // Go back to bids page
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to respond to bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Respond to Bid</h2>
      
      <form onSubmit={handleSubmit}>
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
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Submit Response'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RespondToBid;