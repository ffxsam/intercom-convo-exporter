const axios = require('axios');

module.exports = axios.create({
  baseURL: 'https://api.intercom.io',
  headers: {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    Accept: 'application/json',
  },
});
