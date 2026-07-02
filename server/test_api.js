const jwt = require('jsonwebtoken');
const axios = require('axios');
const token = jwt.sign({ id: '18fdfbc0-47e2-4c3f-a522-ec9dc4c1d71d' }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '7d' });
async function test() {
  try {
    const res1 = await axios.get('https://ca-saathi-two.vercel.app/api/clients', { headers: { Authorization: `Bearer ${token}` } });
    console.log('CLIENTS:', res1.status, res1.data.length);
    const res2 = await axios.get('https://ca-saathi-two.vercel.app/api/deadlines', { headers: { Authorization: `Bearer ${token}` } });
    console.log('DEADLINES:', res2.status, res2.data.length);
    const res3 = await axios.get('https://ca-saathi-two.vercel.app/api/documents', { headers: { Authorization: `Bearer ${token}` } });
    console.log('DOCUMENTS:', res3.status, res3.data.length);
  } catch(e) {
    console.log('ERROR:', e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
  }
}
test();
