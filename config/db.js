const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'crud',
    password: 'postgres',
    port: 5432, // PostgreSQL default port
  });

  pool.on('error', (err, client) => {
    console.error('Error:', err);
  });
  

  pool.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');

    // Your successful connection code can go here
  })
  .catch((error) => {
    console.error('Error connecting to PostgreSQL:', error);
  });

// Export the pool for query execution
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};