const axios = require('axios');
async function poll() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await axios.get('https://ca-saathi-two.vercel.app/api/debug/db');
      console.log('SUCCESS:', res.data);
      return;
    } catch(e) {
      console.log('Not ready yet...', e.response ? e.response.status : e.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}
poll();
