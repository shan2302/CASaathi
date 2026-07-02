const pg = require('pg');
const axios = require('axios');
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

async function run() {
  const originalHash = '$2b$10$AjWK0pQuCZ70EfogdlF5euS.vzaVPFquzUmfhXheZWkFsLizdYs46';
  const testHash = '$2b$10$pVOeAkV/kq/pdod9fsnnWOlnMy5Op5sMaFn3cC3C1MKCZyPGFx752'; // password123

  try {
    // 1. Temporarily change password
    await pool.query("UPDATE users SET password = $1 WHERE email = 'shantanu230205@gmail.com'", [testHash]);
    console.log('PASSWORD TEMPORARILY CHANGED');

    // 2. Login to Vercel
    const loginRes = await axios.post('https://ca-saathi-two.vercel.app/api/auth/login', { email: 'shantanu230205@gmail.com', password: 'password123' });
    const token = loginRes.data.token;
    console.log('LOGGED IN TO VERCEL');

    // 3. Fetch data
    const getRes = await axios.get('https://ca-saathi-two.vercel.app/api/clients-live', { headers: { Authorization: `Bearer ${token}` } });
    console.log('CLIENTS GET:', getRes.status, getRes.data.length);
    if (getRes.data.length === 0) console.log('CLIENTS DATA:', getRes.data);

    const getRes2 = await axios.get('https://ca-saathi-two.vercel.app/api/deadlines', { headers: { Authorization: `Bearer ${token}` } });
    console.log('DEADLINES GET:', getRes2.status, getRes2.data.length);
    
    const getRes3 = await axios.get('https://ca-saathi-two.vercel.app/api/documents', { headers: { Authorization: `Bearer ${token}` } });
    console.log('DOCUMENTS GET:', getRes3.status, getRes3.data.length);

  } catch (err) {
    console.error('ERROR:', err.response ? err.response.status + ' ' + JSON.stringify(err.response.data) : err.message);
  } finally {
    // 4. Restore original password
    await pool.query("UPDATE users SET password = $1 WHERE email = 'shantanu230205@gmail.com'", [originalHash]);
    console.log('PASSWORD RESTORED');
    process.exit(0);
  }
}
run();
