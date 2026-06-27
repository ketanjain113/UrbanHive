const PORT = Number(process.env.PORT || 3001);

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

module.exports = {
  PORT,
  corsOptions,
};
