const pg = require('pg');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const POSTGRES_URI = 'postgresql://neondb_owner:npg_uYiZqPz72gcp@ep-wispy-recipe-aoh4tbe7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function test() {
  const pool = new pg.Pool({ connectionString: POSTGRES_URI });
  try {
    const userResult = await pool.query('SELECT password FROM users WHERE email = $1', ['shantanu230205@gmail.com']);
    const originalPassword = userResult.rows[0].password;
    
    const salt = await bcrypt.genSalt(10);
    const tempPass = await bcrypt.hash('password123', salt);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [tempPass, 'shantanu230205@gmail.com']);
    
    const login = await axios.post('https://ca-saathi-two.vercel.app/api/auth/login', {
      email: 'shantanu230205@gmail.com',
      password: 'password123'
    });
    console.log('LOGIN SUCCESS:', login.data.token.substring(0,20) + '...');
    const token = login.data.token;
    
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [originalPassword, 'shantanu230205@gmail.com']);
    
    const clients = await axios.get('https://ca-saathi-two.vercel.app/api/clients-live', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('CLIENTS-LIVE:', clients.data.length);
    
    try {
        const clientsOld = await axios.get('https://ca-saathi-two.vercel.app/api/clients', {
          headers: { Authorization: 'Bearer ' + token }
        });
        console.log('CLIENTS-OLD:', clientsOld.data.length);
    } catch (e) {
        console.log('CLIENTS-OLD ERR:', e.response ? e.response.status : e.message);
    }
  } catch (err) {
    console.log('ERROR:', err.response ? err.response.data : err.message);
  } finally {
    pool.end();
  }
}
test();
