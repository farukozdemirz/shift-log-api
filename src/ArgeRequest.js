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
          Cookie:
            'ASP.NET_SessionId=k0rfsgn1ya2ohh05rmnztw5qnddupdy/sxzsro8bczikekyd2km=; AppVersion=I=/ve5Q2y79Q; BootstrapVersion=T=I2dI7; Browser_KEY=Key=B7FE6DAFB30D4F8A88653272CF36A4D37C328440; JQueryUIVersion=A=Oyy1avhlTW5CbtZ; JQueryVersion=F=qQl5t6FzNRpL; ServiceVersion=H=o0GP0fyNgGEXbKbpNKC0vceoLC625mdL5rILo12kr78EnNoH93KTlL6+b0UENENiTjYRr0Wevdr382GQlNh1t2; tpc=19.3.2023 01:28:23-538-3128',
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
