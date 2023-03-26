const WorkingHours = require('../../models/WorkingHours');
const ArgeHelper = require('../Helper/ArgeHelper');
const WorkHoursService = require('../Service/WorkHoursService');

class WorkHoursController {
  constructor(user) {
    this.user = user;
  }

  async execute() {
    try {
      const getWorkingHour = await WorkingHours.findOne({
        personelId: this.user.personelId,
      }).sort('-date');
      const actionType = getWorkingHour ? 'update' : 'create';
      const actions = {
        create: this.setAllWorkingHour,
        update: this.setMissingWorkingHour,
      };
      actions[actionType](this, getWorkingHour);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setWorkingHourToDb(workingHour) {
    try {
      workingHour.forEach(async data => {
        const hour = new WorkingHours({
          personelId: this.user.personelId,
          checkInTime: data.checkIn,
          checkOutTime: data.checkOut,
          workingHours: data.workingHour,
          date: data.date,
          dayNameString: data.dayNameString,
        });
        await hour.save();
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setAllWorkingHour(self) {
    try {
      const donemData = ArgeHelper.range(1269, 1271); // range will be used
      const promises = donemData.map(donem => WorkHoursService.getWorkingHours(donem));
      const results = await Promise.all(promises);
      const workingHour = results.reduce((acc, cur) => {
        acc.push(...cur);
        return acc;
      }, []);
      self.setWorkingHourToDb(workingHour);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setMissingWorkingHour(self, workingHours) {
    const lastWorkingHours = await WorkHoursService.getWorkingHours(process.env.Donem_Id);
    const missingWorkingHours = lastWorkingHours.filter(
      item => new Date(item.date) > new Date(workingHours.date)
    );
    if (missingWorkingHours.length > 0) {
      self.setWorkingHourToDb(missingWorkingHours);
    }
    return lastWorkingHours;
  }
}

module.exports = WorkHoursController;
