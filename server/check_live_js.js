const axios = require('axios');
axios.get('https://ca-saathi-two.vercel.app/').then(res => {
  const html = res.data;
  console.log('HTML length:', html.length);
  const match = html.match(/<script type="module" crossorigin src="(.*?)"><\/script>/);
  if (match) {
    console.log('JS Bundle URL:', match[1]);
    axios.get('https://ca-saathi-two.vercel.app' + match[1]).then(jsRes => {
      console.log('JS Contains DEBUG string?', jsRes.data.includes('DEBUG: 0 clients'));
      console.log('JS Contains cache buster?', jsRes.data.includes('?t='));
    });
  } else {
    console.log('No script tag found');
    console.log(html);
  }
});
