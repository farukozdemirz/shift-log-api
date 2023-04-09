/* eslint-disable node/no-unsupported-features/es-syntax */
const axios = require('axios');
const FormData = require('form-data');

class ArgeRequest {
  static async post(path, data) {
    const url = `${process.env.API_URL}${path}`;
    try {
      const formData = new FormData();

      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      const config = {
        method: 'post',
        url: url,
        headers: {
          Cookie: process.env.SESSION,
          ...formData.getHeaders(),
        },
        data: formData,
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async get(path) {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = ArgeRequest;
