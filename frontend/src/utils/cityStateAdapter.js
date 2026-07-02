const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([id, item]) => ({ id, ...item }));
  }
  return [];
};

const withLng = (item) => ({
  ...item,
  lng: item.lng ?? item.lon,
});

const normalizeRoad = (road) => ({
  ...road,
  speed: road.speed ?? road.speed_kmh ?? 0,
});

const normalizeTimestamp = (timestamp) => {
  if (!timestamp) return Date.now();
  return timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
};

export function normalizeCityState(payload, staticData = {}) {
  if (!payload) return staticData;

  const roads = toArray(payload.traffic?.roads ?? payload.roads).map(normalizeRoad);
  const parkingLots = toArray(payload.parking?.lots ?? payload.parking?.parking_lots).map(withLng);
  const chargers = toArray(payload.ev?.chargers).map(withLng);
  const pumps = toArray(payload.petrol?.pumps ?? payload.petrol?.scores).map((pump) =>
    withLng({
      ...pump,
      queue: pump.queue ?? pump.current_queue ?? pump.predicted_queue ?? 0,
    })
  );

  return {
    ...staticData,
    ...payload,
    infra: payload.infra ?? staticData.infra,
    traffic: {
      ...staticData.traffic,
      ...payload.traffic,
      roads,
      avg_speed:
        payload.traffic?.avg_speed ??
        (roads.length
          ? Math.round(roads.reduce((sum, road) => sum + (road.speed || 0), 0) / roads.length)
          : staticData.traffic?.avg_speed ?? 0),
      congested_count:
        payload.traffic?.congested_count ??
        roads.filter((road) => (road.speed || 0) < 25).length,
    },
    parking: {
      ...staticData.parking,
      ...payload.parking,
      lots: parkingLots,
    },
    ev: {
      ...staticData.ev,
      ...payload.ev,
      chargers,
    },
    petrol: {
      ...staticData.petrol,
      ...payload.petrol,
      pumps,
    },
    metrics: {
      ...staticData.metrics,
      ...payload.metrics,
      activeVehicles: payload.metrics?.activeVehicles ?? payload.vehicles?.length ?? 4812,
    },
    timestamp: normalizeTimestamp(payload.timestamp ?? staticData.timestamp),
  };
}
