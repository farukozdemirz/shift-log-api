/* eslint-disable no-undef */

const ArgeRequest = require('../ArgeRequest');
const ArgeHelper = require('../Helper/ArgeHelper');

class WorkHoursService extends ArgeRequest {
  static async getWorkingHours(donem, userData) {
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
        Personel_Id: userData.personelId,
      };
      const response = await this.post(
        '/Personel/PersonelGirisCikis/PersonelPdksGirisCikisListe',
        requestBody,
        userData.sessionId
      );
      return ArgeHelper.formatDateObject(response.data.rows);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = WorkHoursService;
