const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  try {
    const form = new FormData();
    form.append('name', 'AxiosJPEG');
    form.append('status', 'Active');
    form.append('image', fs.createReadStream('uploads/category-images/1778313713809-WhatsApp-Image-2026-04-23-at-2.27.02-PM.jpeg'));

    const response = await axios.post('http://localhost:5000/api/category/create', form, {
      headers: form.getHeaders(),
    });
    console.log('STATUS', response.status);
    console.log(response.data);
  } catch (err) {
    console.error('ERR', err.toString());
    if (err.response) {
      console.error('RESP', err.response.status, err.response.data);
    }
    process.exit(1);
  }
}

run();
