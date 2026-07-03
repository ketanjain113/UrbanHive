import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activateEmergencyCorridor } from '../api/emergency';
import { Siren, Flame, ShieldAlert, Plus, MapPin, Navigation, Car, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      const response = await activateEmergencyCorridor(formData);
      onActivate({
        ...formData,
        ...response,
      });
      onClose();
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

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const types = [
    { id: 'Ambulance', label: 'Medical', icon: Plus },
    { id: 'Fire Engine', label: 'Fire Force', icon: Flame },
    { id: 'Police', label: 'Cops', icon: ShieldAlert }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-rose-950/30 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 z-10 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header with Pulsing Icon */}
            <div className="flex flex-col items-center pt-10 pb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-rose-50 to-white -z-10" />
              
              <div className="relative flex items-center justify-center mb-5">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-28 h-28 bg-[#FF3B30]/30 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="absolute w-24 h-24 bg-[#FF3B30]/40 rounded-full"
                />
                <div className="relative w-16 h-16 bg-[#FF3B30] rounded-full flex items-center justify-center shadow-xl shadow-red-500/40">
                  <Siren className="text-white" size={32} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Emergency Unit</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Select type and destination</p>
            </div>
            
            <div className="px-7 py-2">
              {/* Type Selection */}
              <div className="grid grid-cols-3 gap-3 mb-7">
                {types.map((typeObj) => {
                  const Icon = typeObj.icon;
                  const isSelected = formData.type === typeObj.id;
                  return (
                    <button
                      key={typeObj.id}
                      type="button"
                      onClick={() => handleTypeSelect(typeObj.id)}
                      className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected 
                          ? 'border-[#FF3B30] bg-rose-50 shadow-sm transform -translate-y-0.5' 
                          : 'border-gray-50 bg-gray-50 hover:border-red-100 hover:bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-full mb-2 ${isSelected ? 'bg-white shadow-sm' : ''}`}>
                        <Icon 
                          className={isSelected ? 'text-[#FF3B30]' : 'text-gray-400'} 
                          size={24} 
                          strokeWidth={isSelected ? 2.5 : 2}
                        />
                      </div>
                      <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-[#FF3B30]' : 'text-gray-500'}`}>
                        {typeObj.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Inputs */}
              <div className="space-y-4 mb-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Car className="text-gray-400 group-focus-within:text-[#FF3B30] transition-colors" size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="vehicle_id"
                    required
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    placeholder="Vehicle ID (e.g. AMB-104)"
                    className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:bg-white focus:border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold text-gray-700 placeholder:font-normal placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                <div className="relative">
                  <div className="absolute top-[18px] left-4 flex flex-col items-center h-[calc(100%-36px)] z-10">
                    <Navigation className="text-blue-500 bg-white" size={16} />
                    <div className="flex-1 w-[2px] bg-gray-200 my-1 border-dashed border-l-2 border-gray-200"></div>
                    <MapPin className="text-[#FF3B30] bg-white" size={16} />
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <input 
                      type="text" 
                      name="from_location"
                      required
                      value={formData.from_location}
                      onChange={handleChange}
                      placeholder="From Location"
                      className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-gray-700 placeholder:font-normal placeholder:text-gray-400 shadow-sm"
                    />
                    <input 
                      type="text" 
                      name="to_location"
                      required
                      value={formData.to_location}
                      onChange={handleChange}
                      placeholder="Destination Hospital / Area"
                      className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:bg-white focus:border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10 transition-all font-semibold text-gray-700 placeholder:font-normal placeholder:text-gray-400 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-auto px-7 pb-7">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#FF3B30] text-white rounded-2xl py-4 font-bold tracking-wider shadow-lg shadow-red-500/30 hover:bg-[#FF2D20] hover:shadow-red-500/40 hover:-translate-y-0.5 disabled:transform-none disabled:bg-red-400 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Siren size={20} />
                    </motion.div>
                    ACTIVATING...
                  </>
                ) : (
                  'SEND REPORT'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmergencyModal;
