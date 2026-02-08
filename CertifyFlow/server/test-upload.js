const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
    const form = new FormData();
    form.append('file', fs.createReadStream('../test_certificates.xlsx'), 'test_certificates.xlsx');

    try {
        const response = await axios.post('http://localhost:5000/api/admin/certificates/upload', form, {
            headers: form.getHeaders()
        });
        console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('ERROR STATUS:', error.response?.status);
        console.log('ERROR:', error.response?.data || error.message);
    }
}

testUpload();
