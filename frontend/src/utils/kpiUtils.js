/**
 * KPI Derivation Utilities
 * Extracts and computes KPI metrics from live or mock backend data.
 * Provides fallback values when data is unavailable.
 */

/**
 * Compute average speed with fallback
 */
export const getAverageSpeed = (data) => {
  return data?.traffic?.avg_speed ?? 0;
};

/**
 * Get active vehicle count with fallback
 */
export const getActiveVehicles = (data) => {
  return data?.metrics?.activeVehicles ?? 4812;
};

/**
 * Get CO2 saved today in metric tons with fallback
 */
export const getCO2Saved = (data) => {
  return data?.metrics?.co2Saved ?? 1.2;
};

/**
 * Get average travel time in minutes with fallback
 */
export const getAverageTravelTime = (data) => {
  return data?.metrics?.avgTravelTime ?? 15;
};

/**
 * Compute parking occupancy percentage with fallback
 */
export const getParkingOccupancy = (data) => {
  if (!data?.parking?.lots || data.parking.lots.length === 0) {
    return 82; // fallback
  }
  
  const totalCapacity = data.parking.lots.reduce((sum, lot) => sum + (lot.capacity || 0), 0);
  const totalOccupied = data.parking.lots.reduce((sum, lot) => sum + (lot.occupied || 0), 0);
  
  return totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 82;
};

/**
 * Compute EV charger load percentage with fallback
 */
export const getEVChargerLoad = (data) => {
  if (!data?.ev?.chargers || data.ev.chargers.length === 0) {
    return 68; // fallback
  }
  
  const totalLoad = data.ev.chargers.reduce((sum, charger) => sum + (charger.load || 0), 0);
  const avgLoad = data.ev.chargers.length > 0 
    ? Math.round(totalLoad / data.ev.chargers.length) 
    : 68;
  
  return avgLoad;
};

/**
 * Compute congestion index (0-100) with fallback
 */
export const getCongestionIndex = (data) => {
  return data?.metrics?.congestionIndex ?? 
         (data?.traffic?.congested_count 
           ? Math.round((data.traffic.congested_count / Math.max(data.traffic.roads?.length || 1, 1)) * 100)
           : 35);
};

/**
 * Get temperature reading with fallback
 */
export const getTemperature = (data) => {
  return data?.environment?.temperature ?? 32;
};

/**
 * Get air quality index with fallback
 */
export const getAQI = (data) => {
  return data?.environment?.aqi ?? 76;
};

/**
 * Bundle all KPI metrics
 */
export const getAllKPIs = (data) => ({
  avgSpeed: getAverageSpeed(data),
  activeVehicles: getActiveVehicles(data),
  co2Saved: getCO2Saved(data),
  avgTravelTime: getAverageTravelTime(data),
  parkingOccupancy: getParkingOccupancy(data),
  evChargerLoad: getEVChargerLoad(data),
  congestionIndex: getCongestionIndex(data),
  temperature: getTemperature(data),
  aqi: getAQI(data),
});
