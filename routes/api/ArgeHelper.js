/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const ArgeRequest = require('../../src/ArgeRequest.js');
const WorkingHours = require('../../models/WorkingHours');

class ArgeHelper extends ArgeRequest {
  constructor() {
    super();
    this.user = {};
    this.workingHourData = {
      checkIn: {},
      checkOut: {},
    };
  }

  static setUser(user) {
    this.user = user;
  }

  static async getTokenInfo() {
    const inputName = 'tokeninfo';

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(process.env.API_URL);

      await page.waitForFunction(() => {
        const input = document.querySelector('input[name="tokeninfo"]');
        return input && input.value !== '';
      });

      const value = await page.$eval(`input[name="${inputName}"]`, el => el.value);
      await browser.close();
      return value;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async argePortalLogin(email, password, tokenInfo) {
    try {
      const requestBody = {
        Email: email,
        Sifre: password,
        tokenInfo: tokenInfo,
      };
      const req = this.post('/Account/LogOn', requestBody);
      return req;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static checkUserErrorMessage(text) {
    const regex = /<div class="error-message" style=display:block>([\s\S]+?)<\/div>/;
    const regex2 = /<div class="error-message show">([\s\S]+?)<\/div>/;
    const regex3 = /<input type="hidden" id="ErrorMesssage" value="([\s\S]+?)"/;

    const error = text.match(regex) || [];
    const error2 = text.match(regex2) || [];
    const error3 = text.match(regex3) || [];

    if (error.length > 0) {
      return error[1].trim();
    }

    if (error2.length > 0) {
      return error2[1].trim();
    }

    if (error3.length > 0) {
      return error3[1].trim();
    }

    return false;
  }

  static convertCheckinToCheckOut(workingHoursData, date) {
    const lastCheckIn = workingHoursData.reduce((acc, current) => {
      const splitItem = current.cell[5].split('T');
      if (splitItem[0] === date) {
        // eslint-disable-next-line prefer-destructuring, no-param-reassign
        acc = current.cell[5];
      }
      return acc;
    }, '');

    this.workingHourData.checkOut[date] = lastCheckIn;
    return lastCheckIn;
  }

  static formatDateObject(workingHoursData) {
    workingHoursData.forEach(element => {
      const date = element.cell[5].split('T')[0];
      const time = element.cell[5];
      const type = element.cell[6];

      const checkType = {
        G: 'checkIn',
        C: 'checkOut',
      }[type];

      if (type === 'G' && !this.workingHourData.checkIn[date]) {
        this.workingHourData[checkType][date] = time;
      } else if (type === 'C') {
        this.workingHourData[checkType][date] = time;
      }
    });

    const gecisler = Object.entries(this.workingHourData.checkIn).map(([date, checkIn]) => {
      const checkoutDate = this.workingHourData.checkOut[date];
      const checkInDate = this.workingHourData.checkIn[date];
      const checkout = checkoutDate || this.convertCheckinToCheckOut(workingHoursData, date);

      return {
        date,
        checkIn: checkIn.split('T')[1],
        checkOut: checkout.split('T')[1],
        workingHour: this.calculateWorkingHours(checkInDate, this.workingHourData.checkOut[date]),
      };
    });

    return gecisler;
  }

  static removeSecond(date) {
    const dateWithoutSeconds = date.replace(/:\d{2}$/, '');
    return dateWithoutSeconds;
  }

  static calculateWorkingHours(checkIn, checkOut) {
    function checkZero(number) {
      return number < 10 ? `0${number}` : number;
    }
    const checkInDate = new Date(this.removeSecond(checkIn));
    const checkOutDate = new Date(this.removeSecond(checkOut));
    const diffInMs = checkOutDate - checkInDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    return `${checkZero(hours)}:${checkZero(minutes)}`;
  }

  static async getWorkingHoursFromArgePortal(donem) {
    try {
      const requestBody = {
        page: 1,
        rp: 50,
        sortname: 'Id',
        sortorder: 'asc',
        query: '',
        qtype: '',
        Firma_Id: process.env.Firma_Id,
        string_Firma_Id: process.env.string_Firma_Id,
        undefined: 'Firma_Id,Donem_Id,Personel_Id',
        Donem_Id: donem,
        Personel_Id: process.env.Personel_Id,
      };
      const response = await this.post(
        '/Personel/PersonelGirisCikis/PersonelPdksGirisCikisListe',
        requestBody
      );
      return this.formatDateObject(response.data.rows);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async setAllWorkingHour() {
    try {
      const donemData = ['1269', '1270', '1271'];
      const promises = donemData.map(donem => this.getWorkingHoursFromArgePortal(donem));
      const results = await Promise.all(promises);
      const workingHour = results.reduce((acc, cur) => {
        acc.push(...cur);
        return acc;
      }, []);
      this.setWorkingHourToDb(workingHour);
      return workingHour;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async setMissingWorkingHour(getWorkingHour) {
    const lastWorkingHours = await this.getWorkingHoursFromArgePortal(process.env.Donem_Id);
    const missingWorkingHours = lastWorkingHours.filter(
      item => new Date(item.date) > new Date(getWorkingHour.date)
    );
    if (missingWorkingHours.length > 0) {
      this.setWorkingHourToDb(missingWorkingHours);
    }
    return lastWorkingHours;
  }

  static async checkWorkingHour() {
    this.workingHourData = {
      checkIn: {},
      checkOut: {},
    };
    try {
      const getWorkingHour = await WorkingHours.findOne({
        personelId: this.user.personelId,
      }).sort('-date');
      const actionType = getWorkingHour ? 'update' : 'create';
      const actions = {
        create: this.setAllWorkingHour,
        update: this.setMissingWorkingHour,
      };
      actions[actionType](getWorkingHour);
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async setWorkingHourToDb(workingHour) {
    try {
      workingHour.forEach(async data => {
        const hour = new WorkingHours({
          personelId: this.user.personelId,
          checkInTime: data.checkIn,
          checkOutTime: data.checkOut,
          workingHours: data.workingHour,
          date: data.date,
        });
        await hour.save();
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async Logout() {
    try {
      const requestBody = {};
      const req = this.post('/Home/Logout', requestBody);
      this.setUser({});
      return req;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = ArgeHelper;
