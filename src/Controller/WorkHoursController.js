const moment = require('moment');
const { WorkingHours, WorkingEntry } = require('../../models/WorkingHours');
const ArgeHelper = require('../Helper/ArgeHelper');
const WorkHoursService = require('../Service/WorkHoursService');

class WorkHoursController {
  constructor(user) {
    this.user = user;
  }

  async execute() {
    try {
      const getWorkingHour = await WorkingHours.findOne({
        userId: this.user.userId,
      })
        .populate('entries')
        .sort('-date');
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
      const bulkOps = workingHour.map(data => {
        const entries = data.entries.map(entry => {
          const workingEntry = new WorkingEntry({
            type: entry.type,
            time: entry.time,
          });
          return workingEntry.save();
        });

        return Promise.all(entries).then(workingEntryIds => {
          return {
            userId: this.user.userId,
            date: data.date,
            dayNameString: data.dayNameString,
            entries: workingEntryIds,
          };
        });
      });

      const hours = await Promise.all(bulkOps);
      await WorkingHours.insertMany(hours);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setAllWorkingHour(self) {
    try {
      const donemData = ArgeHelper.range(1269, 1272); // range will be used
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
    } else {
      const recordOfLastDayFromArge = lastWorkingHours.reduce((acc, curr) => {
        return new Date(curr.date) > new Date(acc.date) ? curr : acc;
      });
      const times = workingHours.entries.map(obj => moment(obj.time, 'HH:mm:ss'));
      const maxTime = moment.max(times).format('HH:mm:ss');
      const getNewRecords = recordOfLastDayFromArge.entries.filter(item =>
        moment(item.time, 'HH:mm:ss').isAfter(moment(maxTime, 'HH:mm:ss'))
      );
      if (getNewRecords.length > 0) {
        const newWorkingEntries = getNewRecords.map(entry => new WorkingEntry(entry));
        const savedEntries = await WorkingEntry.insertMany(newWorkingEntries);
        workingHours.entries.push(...savedEntries);
        await workingHours.save();
      }
    }
  }
}

module.exports = WorkHoursController;
