import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activateEmergencyCorridor } from '../api/emergency';

const EmergencyModal = ({ onClose, onActivate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle_id: '',
    type: 'Ambulance',
    from_location: '',
    to_location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call relay API to activate corridor
      const response = await activateEmergencyCorridor(formData);
      
      // Merge form data with response (coordinates and metadata)
      onActivate({
        ...formData,
        ...response,
      });
      
      onClose();
      
      // Redirect to green corridor page
      navigate('/emergency-corridor');
    } catch (err) {
      setError(err.message || 'Failed to activate emergency corridor');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/40">
        <div className="bg-gradient-to-r from-[#FF3B30] to-[#FF453A] p-5 text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
            Activate Emergency Corridor
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
            <input 
              type="text" 
              name="vehicle_id"
              required
              value={formData.vehicle_id}
              onChange={handleChange}
              placeholder="e.g. AMB-104"
              className="w-full border border-gray-200/60 bg-white/50 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF3B30] focus:ring-2 focus:ring-[#FF3B30]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex gap-4">
              {['Ambulance', 'Fire Engine', 'Police'].map(type => (
                <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                    className="text-red-600 focus:ring-red-500"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
            <input 
              type="text" 
              name="from_location"
              required
              value={formData.from_location}
              onChange={handleChange}
              placeholder="e.g. Vijay Nagar Crossing"
              className="w-full border border-gray-200/60 bg-white/50 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF3B30] focus:ring-2 focus:ring-[#FF3B30]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
            <input 
              type="text" 
              name="to_location"
              required
              value={formData.to_location}
              onChange={handleChange}
              placeholder="e.g. MY Hospital"
              className="w-full border border-gray-200/60 bg-white/50 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF3B30] focus:ring-2 focus:ring-[#FF3B30]/20 transition-all"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 bg-gray-200/50 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-[#FF3B30] text-white rounded-full font-semibold shadow-md hover:bg-[#FF453A] disabled:bg-red-400 transition-all"
            >
              {loading ? 'Activating...' : 'ACTIVATE CORRIDOR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyModal;
