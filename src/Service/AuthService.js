/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const ArgeRequest = require('../../src/ArgeRequest.js');

class AuthService extends ArgeRequest {
  static async getCsrfToken() {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(process.env.API_URL);

      await page.waitForFunction(() => {
        const input = document.querySelector(`input[name="tokeninfo"]`);
        return input && input.value !== '';
      });

      const value = await page.$eval(`input[name="tokeninfo"]`, el => el.value);
      await browser.close();
      return value;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async login(email, password) {
    try {
      const requestBody = {
        Email: email,
        Sifre: password,
        tokenInfo: await this.getCsrfToken(),
      };
      return this.post('/Account/LogOn', requestBody);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async logout() {
    return this.post('/Home/Logout', {});
  }
}

module.exports = AuthService;
