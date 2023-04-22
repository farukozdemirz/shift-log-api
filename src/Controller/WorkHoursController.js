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
      return actions[actionType](this, getWorkingHour);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateWorkingHourToDb(workingHour) {
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

      const updateOps = hours.map(hour => ({
        updateOne: {
          filter: { userId: hour.userId, date: hour.date },
          update: {
            $set: {
              entries: hour.entries,
            },
          },
          upsert: true,
        },
      }));
      await WorkingHours.bulkWrite(updateOps);
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
      const donemData = ArgeHelper.range(); // range will be used
      const promises = donemData.map(donem =>
        WorkHoursService.getWorkingHours(donem, {
          sessionId: self.user.sessionId,
          personelId: self.user.personelId,
        })
      );
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

  async setMissingWorkingHour(self) {
    // this is workaround for missing working hours
    const lastWorkingHours = await WorkHoursService.getWorkingHours(process.env.Donem_Id, {
      sessionId: self.user.sessionId,
      personelId: self.user.personelId,
    });
    self.updateWorkingHourToDb(lastWorkingHours);
  }
}

module.exports = WorkHoursController;
