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

const normalizeRoad = (road, rlPhase = 'NS_GREEN') => {
  const speed = road.speed ?? road.speed_kmh ?? 0;
  const status = road.status ?? road.congestion ?? (speed > 30 ? 'flowing' : speed >= 15 ? 'moderate' : 'heavy');
  return {
    ...road,
    speed,
    status,
    phase: road.phase ?? rlPhase,
  };
};

const normalizeTimestamp = (timestamp) => {
  if (!timestamp) return Date.now();
  return timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
};

export function normalizeCityState(payload, staticData = {}) {
  if (!payload) return staticData;

  const rlPhase = payload.rl?.phase || 'NS_GREEN';
  const roads = toArray(payload.traffic?.roads ?? payload.roads).map((road) => normalizeRoad(road, rlPhase));
  
  const parkingLots = toArray(payload.parking?.lots ?? payload.parking?.parking_lots).map((lot) =>
    withLng({
      ...lot,
      eta_full: lot.eta_full ?? lot.eta_to_full_minutes ?? 'N/A',
    })
  );
  
  const chargers = toArray(payload.ev?.chargers).map((charger) =>
    withLng({
      ...charger,
      bays_total: charger.bays_total ?? charger.capacity ?? 10,
      bays_free: charger.bays_free ?? Math.max(0, Math.round((charger.capacity || 10) * (1 - (charger.load || 0) / 100))),
      suggestion: charger.suggestion ?? charger.reason,
    })
  );
  
  const recommendedId = payload.petrol?.recommended_pump;
  const recommendedName = payload.petrol?.recommended_pump_name;
  const pumps = toArray(payload.petrol?.pumps ?? payload.petrol?.scores).map((pump) => {
    const queue = pump.queue ?? pump.current_queue ?? pump.predicted_queue ?? 0;
    const congestionMult = pump.congestion_mult ?? 1.0;
    const congestion = pump.congestion ?? (congestionMult > 1.2 ? 'High' : congestionMult < 0.9 ? 'Low' : 'Moderate');
    const recommended = pump.recommended ?? (pump.id === recommendedId || pump.name === recommendedName);
    return withLng({
      ...pump,
      queue,
      congestion,
      recommended,
    });
  });

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
