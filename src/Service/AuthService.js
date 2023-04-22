/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const ArgeRequest = require('../../src/ArgeRequest.js');
const ArgeHelper = require('../Helper/ArgeHelper.js');

class AuthService extends ArgeRequest {
  static async getArgePersonelId(sessionId) {
    const requestBody = {
      Donem_Id: Math.max(...ArgeHelper.range(1269, 1272)),
      Firma_Id: process.env.Firma_Id,
    };
    try {
      const response = await this.post(
        '/PersonelSabit/PersonelPDKSDonemdeCalisanPersonelListesi',
        requestBody,
        sessionId
      );
      return response.data[0].id;
    } catch (error) {
      throw new Error(error.message);
    }
  }

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

  static async login(Email, Sifre, tokenInfo, sessionId) {
    try {
      const requestBody = {
        Email,
        Sifre,
        tokenInfo,
      };
      return this.post('/Account/LogOn', requestBody, sessionId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async logout(sessionId) {
    return this.post('/Home/Logout', {}, sessionId);
  }
}

module.exports = AuthService;
