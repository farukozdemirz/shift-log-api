/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const ArgeRequest = require('../../src/ArgeRequest.js');

class AuthService extends ArgeRequest {
  static async getCsrfToken() {
    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true,
      });
      const page = await browser.newPage();

      await page.goto(process.env.API_URL);

      await page.waitForFunction(() => {
        const input = document.querySelector(`input[name="tokeninfo"]`);
        return input && input.value !== '';
      });

      const cookies = await page.cookies();
      const value = await page.$eval(`input[name="tokeninfo"]`, el => el.value);
      await browser.close();

      return {
        tokenInfo: value,
        sessionId: cookies[0].value,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async login(Email, Sifre) {
    try {
      const { tokenInfo, sessionId } = await this.getCsrfToken();
      const requestBody = {
        Email,
        Sifre,
        tokenInfo,
        sessionId,
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
