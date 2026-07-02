const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('https://ca-saathi-two.vercel.app/api/auth/login', { email: 'urgenttest4@test.com', password: 'password123' });
    const token = res.data.token;
    const getRes = await axios.get('https://ca-saathi-two.vercel.app/api/clients', { headers: { Authorization: `Bearer ${token}` } });
    console.log('HEADERS:', getRes.headers['cache-control']);
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}
test();
